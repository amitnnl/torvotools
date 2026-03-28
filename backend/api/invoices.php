<?php
// api/invoices.php - Automated Invoicing for Procurement

function get_invoices($id = null, $user_data = null) {
    $database = new Database();
    $db = $database->getConnection();

    if ($user_data->role === 'admin') {
        if ($id) {
            $query = "SELECT i.*, u.name as customer_name, u.email as customer_email, r.urgency as rfq_urgency, r.site_location 
                      FROM invoices i 
                      JOIN users u ON i.user_id = u.id 
                      LEFT JOIN rfqs r ON i.rfq_id = r.id
                      WHERE i.id = :id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id', $id);
        } else {
            $query = "SELECT i.*, u.name as customer_name FROM invoices i JOIN users u ON i.user_id = u.id ORDER BY i.created_at DESC";
            $stmt = $db->prepare($query);
        }
    } else {
        if ($id) {
            $query = "SELECT i.*, r.urgency as rfq_urgency, r.site_location 
                      FROM invoices i 
                      LEFT JOIN rfqs r ON i.rfq_id = r.id
                      WHERE i.id = :id AND i.user_id = :user_id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->bindParam(':user_id', $user_data->id);
        } else {
            $query = "SELECT i.* FROM invoices i WHERE i.user_id = :user_id ORDER BY i.id DESC";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':user_id', $user_data->id);
        }
    }

    $stmt->execute();
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    http_response_code(200);
    echo json_encode($results);
}

function post_invoices($id = null, $user_data = null) {
    if ($user_data->role !== 'admin') {
        http_response_code(403);
        echo json_encode(["message" => "Forbidden."]);
        return;
    }

    $database = new Database();
    $db = $database->getConnection();
    $data = json_decode(file_get_contents("php://input"));

    if (!empty($data->user_id) && !empty($data->total_amount)) {
        $invoice_number = 'INV-' . time() . '-' . rand(1000, 9999);
        $query = "INSERT INTO invoices (user_id, rfq_id, order_id, invoice_number, subtotal, tax_amount, total_amount, status, due_date) 
                  VALUES (:user_id, :rfq_id, :order_id, :invoice_number, :subtotal, :tax_amount, :total_amount, :status, :due_date)";
        $stmt = $db->prepare($query);

        $rfq_id = $data->rfq_id ?? null;
        $order_id = $data->order_id ?? null;
        $tax_amount = $data->tax_amount ?? ($data->total_amount * 0.1); // Default 10%
        $subtotal = $data->subtotal ?? ($data->total_amount - $tax_amount);
        $status = $data->status ?? 'pending';
        $due_date = $data->due_date ?? date('Y-m-d', strtotime('+15 days'));

        $stmt->bindParam(':user_id', $data->user_id);
        $stmt->bindParam(':rfq_id', $rfq_id);
        $stmt->bindParam(':order_id', $order_id);
        $stmt->bindParam(':invoice_number', $invoice_number);
        $stmt->bindParam(':subtotal', $subtotal);
        $stmt->bindParam(':tax_amount', $tax_amount);
        $stmt->bindParam(':total_amount', $data->total_amount);
        $stmt->bindParam(':status', $status);
        $stmt->bindParam(':due_date', $due_date);

        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode(["message" => "Invoice generated.", "invoice_number" => $invoice_number]);
        } else {
            http_response_code(500);
            echo json_encode(["message" => "Invoicing failure."]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Incomplete parameters."]);
    }
}

function patch_invoices($id = null, $user_data = null) {
    if (!$id) {
        http_response_code(400);
        return;
    }

    $database = new Database();
    $db = $database->getConnection();
    $data = json_decode(file_get_contents("php://input"));

    if (isset($data->status) && $data->status === 'paid') {
        $db->beginTransaction();
        try {
            // 1. Get invoice and order details
            $query = "SELECT i.*, o.payment_method 
                      FROM invoices i 
                      LEFT JOIN orders o ON i.order_id = o.id 
                      WHERE i.id = :id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->execute();
            $invoice = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$invoice) throw new Exception("Invoice not found.");
            if ($invoice['status'] === 'paid') throw new Exception("Invoice already paid.");

            // 2. Update invoice status
            $up_query = "UPDATE invoices SET status = 'paid' WHERE id = :id";
            $up_stmt = $db->prepare($up_query);
            $up_stmt->bindParam(':id', $id);
            $up_stmt->execute();

            // 3. If it was a credit invoice, reconcile credit balance
            if ($invoice['payment_method'] === 'credit_invoice') {
                $rec_query = "UPDATE credit_accounts SET current_balance = current_balance - :amount WHERE user_id = :user_id";
                $rec_stmt = $db->prepare($rec_query);
                $rec_stmt->bindParam(':amount', $invoice['total_amount']);
                $rec_stmt->bindParam(':user_id', $invoice['user_id']);
                $rec_stmt->execute();
            }

            $db->commit();
            echo json_encode(["message" => "Payment successful. Credit reconciled."]);
        } catch (Exception $e) {
            $db->rollBack();
            http_response_code(500);
            echo json_encode(["message" => $e->getMessage()]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Invalid status update."]);
    }
}
