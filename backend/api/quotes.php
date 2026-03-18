<?php
// POST /api/quotes - Submit a quote for an RFQ (admin only)
function post_quotes($id = null, $user_data = null) {
    if ($user_data->role !== 'admin') {
        http_response_code(403);
        echo json_encode(array("message" => "Forbidden."));
        exit();
    }

    $database = new Database();
    $db = $database->getConnection();
    $data = json_decode(file_get_contents("php://input"));

    if (!empty($data->rfq_id) && !empty($data->quoted_price)) {
        $query = "INSERT INTO quotes (rfq_id, admin_id, quoted_price) VALUES (:rfq_id, :admin_id, :quoted_price)";
        $stmt = $db->prepare($query);

        $rfq_id = htmlspecialchars(strip_tags($data->rfq_id));
        $quoted_price = htmlspecialchars(strip_tags($data->quoted_price));

        $stmt->bindParam(":rfq_id", $rfq_id);
        $stmt->bindParam(":admin_id", $user_data->id);
        $stmt->bindParam(":quoted_price", $quoted_price);

        if ($stmt->execute()) {
            // Update RFQ status to 'quoted'
            $query_rfq = "UPDATE rfqs SET status = 'quoted' WHERE id = :rfq_id";
            $stmt_rfq = $db->prepare($query_rfq);
            $stmt_rfq->bindParam(":rfq_id", $rfq_id);
            $stmt_rfq->execute();

            http_response_code(201);
            echo json_encode(array("message" => "Quote submitted successfully."));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to submit quote."));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Incomplete data."));
    }
}

// GET /api/quotes - Get quotes
function get_quotes($id = null, $user_data = null) {
    $database = new Database();
    $db = $database->getConnection();

    if ($user_data->role === 'admin') {
        $query = "SELECT q.*, r.quantity, p.name as product_name, p.image_url, u.name as dealer_name, d.company_name 
                  FROM quotes q 
                  JOIN rfqs r ON q.rfq_id = r.id 
                  JOIN products p ON r.product_id = p.id 
                  JOIN users u ON r.dealer_id = u.id 
                  JOIN dealer_details d ON u.id = d.user_id
                  ORDER BY q.created_at DESC";
        $stmt = $db->prepare($query);
    } else if ($user_data->role === 'dealer') {
        $query = "SELECT q.*, r.quantity, p.name as product_name, p.image_url 
                  FROM quotes q 
                  JOIN rfqs r ON q.rfq_id = r.id 
                  JOIN products p ON r.product_id = p.id 
                  WHERE r.dealer_id = :dealer_id 
                  ORDER BY q.created_at DESC";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":dealer_id", $user_data->id);
    } else {
        http_response_code(403);
        echo json_encode(array("message" => "Forbidden."));
        exit();
    }

    $stmt->execute();
    $num = $stmt->rowCount();

    if ($num > 0) {
        $quotes_arr = array();
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            array_push($quotes_arr, $row);
        }
        http_response_code(200);
        echo json_encode($quotes_arr);
    } else {
        http_response_code(200);
        echo json_encode([]);
    }
}

// PUT /api/quotes/{id} - Approve/reject a quote (dealer only)
function put_quotes($id = null, $user_data = null) {
    if ($user_data->role !== 'dealer' || !$id) {
        http_response_code(403);
        echo json_encode(array("message" => "Forbidden."));
        exit();
    }

    $database = new Database();
    $db = $database->getConnection();
    $data = json_decode(file_get_contents("php://input"));

    if (isset($data->status) && in_array($data->status, ['approved', 'rejected'])) {
        // You might want to verify that the dealer owns this quote's RFQ
        
        $query = "UPDATE quotes SET status = :status WHERE id = :id";
        $stmt = $db->prepare($query);

        $status = htmlspecialchars(strip_tags($data->status));
        $stmt->bindParam(":status", $status);
        $stmt->bindParam(":id", $id);

        if ($stmt->execute()) {
            if ($status === 'approved') {
                // Trigger Automated Invoicing Flow
                $query_quote = "SELECT q.*, r.dealer_id, r.quantity FROM quotes q JOIN rfqs r ON q.rfq_id = r.id WHERE q.id = :quote_id";
                $stmt_quote = $db->prepare($query_quote);
                $stmt_quote->bindParam(':quote_id', $id);
                $stmt_quote->execute();
                $quote_data = $stmt_quote->fetch(PDO::FETCH_ASSOC);

                if ($quote_data) {
                    $total_amount = $quote_data['quoted_price'] * $quote_data['quantity'];
                    $tax_amount = $total_amount * 0.1; // Standard 10%
                    $subtotal = $total_amount - $tax_amount;
                    $invoice_number = 'INV-AUTO-' . time();
                    $due_date = date('Y-m-d', strtotime('+7 days'));

                    $query_inv = "INSERT INTO invoices (user_id, rfq_id, invoice_number, subtotal, tax_amount, total_amount, status, due_date) 
                                 VALUES (:user_id, :rfq_id, :invoice_number, :subtotal, :tax_amount, :total_amount, 'pending', :due_date)";
                    $stmt_inv = $db->prepare($query_inv);
                    $stmt_inv->bindParam(':user_id', $quote_data['dealer_id']);
                    $stmt_inv->bindParam(':rfq_id', $quote_data['rfq_id']);
                    $stmt_inv->bindParam(':invoice_number', $invoice_number);
                    $stmt_inv->bindParam(':subtotal', $subtotal);
                    $stmt_inv->bindParam(':tax_amount', $tax_amount);
                    $stmt_inv->bindParam(':total_amount', $total_amount);
                    $stmt_inv->bindParam(':due_date', $due_date);
                    $stmt_inv->execute();
                }
            }
            http_response_code(200);
            echo json_encode(array("message" => "Quote status updated. Automated invoice generated."));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to update quote status."));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Incomplete or invalid data."));
    }
}
?>