<?php
// POST /api/rfqs - Submit an RFQ (dealers only)
function post_rfqs($id = null, $user_data = null) {
    if ($user_data->role !== 'dealer') {
        http_response_code(403);
        echo json_encode(array("message" => "Forbidden."));
        exit();
    }

    $database = new Database();
    $db = $database->getConnection();
    $data = json_decode(file_get_contents("php://input"));

    if (!empty($data->product_id) && !empty($data->quantity)) {
        // You might want to check if the dealer is approved first
        // $query_check = "SELECT is_approved FROM dealer_details WHERE user_id = :user_id"; ...

        $query = "INSERT INTO rfqs (dealer_id, product_id, quantity, notes, urgency, site_location) VALUES (:dealer_id, :product_id, :quantity, :notes, :urgency, :site_location)";
        $stmt = $db->prepare($query);

        $product_id = htmlspecialchars(strip_tags($data->product_id));
        $quantity = htmlspecialchars(strip_tags($data->quantity));
        $notes = !empty($data->notes) ? htmlspecialchars(strip_tags($data->notes)) : '';
        $urgency = !empty($data->urgency) ? htmlspecialchars(strip_tags($data->urgency)) : 'Normal';
        $site_location = !empty($data->site_location) ? htmlspecialchars(strip_tags($data->site_location)) : '';

        $stmt->bindParam(":dealer_id", $user_data->id);
        $stmt->bindParam(":product_id", $product_id);
        $stmt->bindParam(":quantity", $quantity);
        $stmt->bindParam(":notes", $notes);
        $stmt->bindParam(":urgency", $urgency);
        $stmt->bindParam(":site_location", $site_location);

        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode(array("message" => "RFQ submitted successfully."));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to submit RFQ."));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Incomplete data."));
    }
}

// GET /api/rfqs - Get RFQs
function get_rfqs($id = null, $user_data = null) {
    if (!$user_data) {
        http_response_code(401);
        echo json_encode(["message" => "Unauthorized."]);
        return;
    }

    $database = new Database();
    $db = $database->getConnection();

    if ($user_data->role === 'admin') {
        $query = "SELECT r.*, p.name as product_name, u.name as dealer_name, q.quoted_price 
                  FROM rfqs r 
                  JOIN products p ON r.product_id = p.id 
                  JOIN users u ON r.dealer_id = u.id 
                  LEFT JOIN quotes q ON r.id = q.rfq_id
                  ORDER BY r.created_at DESC";
        $stmt = $db->prepare($query);
    } else if ($user_data->role === 'dealer') {
        $query = "SELECT r.*, p.name as product_name, q.quoted_price, q.id as quote_id
                  FROM rfqs r 
                  JOIN products p ON r.product_id = p.id 
                  LEFT JOIN quotes q ON r.id = q.rfq_id
                  WHERE r.dealer_id = :dealer_id 
                  ORDER BY r.created_at DESC";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":dealer_id", $user_data->id);
    } else {
        http_response_code(403);
        echo json_encode(["message" => "Forbidden."]);
        return;
    }

    $stmt->execute();
    $num = $stmt->rowCount();

    if ($num > 0) {
        $rfqs_arr = array();
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            array_push($rfqs_arr, $row);
        }
        http_response_code(200);
        echo json_encode($rfqs_arr);
    } else {
        http_response_code(200);
        echo json_encode([]);
    }
}
?>