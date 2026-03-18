<?php
// api/shipping.php - Advanced Logistics for Job-Site Deliveries

function get_shipping($id = null, $user_data = null) {
    $database = new Database();
    $db = $database->getConnection();

    if ($user_data->role === 'admin') {
        if ($id) {
            $query = "SELECT s.*, o.user_id as customer_id 
                      FROM shipments s 
                      LEFT JOIN orders o ON s.order_id = o.id 
                      WHERE s.id = :id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id', $id);
        } else {
            $query = "SELECT * FROM shipments ORDER BY created_at DESC";
            $stmt = $db->prepare($query);
        }
    } else {
        // Customers/Dealers see only their shipments
        if ($id) {
            $query = "SELECT s.* FROM shipments s 
                      LEFT JOIN orders o ON s.order_id = o.id 
                      LEFT JOIN rfqs r ON s.rfq_id = r.id
                      WHERE s.id = :id AND (o.user_id = :user_id OR r.dealer_id = :dealer_id)";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->bindParam(':user_id', $user_data->id);
            $stmt->bindParam(':dealer_id', $user_data->id);
        } else {
            $query = "SELECT s.* FROM shipments s 
                      LEFT JOIN orders o ON s.order_id = o.id 
                      LEFT JOIN rfqs r ON s.rfq_id = r.id
                      WHERE (o.user_id = :user_id OR r.dealer_id = :dealer_id)
                      ORDER BY s.created_at DESC";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':user_id', $user_data->id);
            $stmt->bindParam(':dealer_id', $user_data->id);
        }
    }

    $stmt->execute();
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    http_response_code(200);
    echo json_encode($results);
}

function post_shipping($id = null, $user_data = null) {
    if ($user_data->role !== 'admin') {
        http_response_code(403);
        echo json_encode(["message" => "Forbidden."]);
        return;
    }

    $database = new Database();
    $db = $database->getConnection();
    $data = json_decode(file_get_contents("php://input"));

    if (!empty($data->tracking_number)) {
        $query = "INSERT INTO shipments (order_id, rfq_id, tracking_number, courier_partner, shipping_status, estimated_delivery, site_coordinates, site_contact_name, site_contact_phone) 
                  VALUES (:order_id, :rfq_id, :tracking_number, :courier_partner, :shipping_status, :estimated_delivery, :site_coordinates, :site_contact_name, :site_contact_phone)";
        $stmt = $db->prepare($query);

        $order_id = $data->order_id ?? null;
        $rfq_id = $data->rfq_id ?? null;
        $courier_partner = $data->courier_partner ?? 'TORVO LOGISTICS';
        $status = $data->shipping_status ?? 'manifested';
        $est = $data->estimated_delivery ?? null;
        $coords = $data->site_coordinates ?? '';
        $contact = $data->site_contact_name ?? '';
        $phone = $data->site_contact_phone ?? '';

        $stmt->bindParam(':order_id', $order_id);
        $stmt->bindParam(':rfq_id', $rfq_id);
        $stmt->bindParam(':tracking_number', $data->tracking_number);
        $stmt->bindParam(':courier_partner', $courier_partner);
        $stmt->bindParam(':shipping_status', $status);
        $stmt->bindParam(':estimated_delivery', $est);
        $stmt->bindParam(':site_coordinates', $coords);
        $stmt->bindParam(':site_contact_name', $contact);
        $stmt->bindParam(':site_contact_phone', $phone);

        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode(["message" => "Shipment manifest created."]);
        } else {
            http_response_code(500);
            echo json_encode(["message" => "Failed to manifest shipment."]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Incomplete shipment data."]);
    }
}

function put_shipping($id = null, $user_data = null) {
    if ($user_data->role !== 'admin') {
        http_response_code(403);
        return;
    }

    $database = new Database();
    $db = $database->getConnection();
    $data = json_decode(file_get_contents("php://input"));

    if (!$id) {
        http_response_code(400);
        return;
    }

    if (isset($data->action) && $data->action === 'sign') {
        $query = "UPDATE shipments SET 
                  digital_signature = :signature,
                  signed_by_name = :signed_by,
                  signed_at = CURRENT_TIMESTAMP,
                  shipping_status = 'delivered'
                  WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':signature', $data->digital_signature);
        $stmt->bindParam(':signed_by', $data->signed_by_name);
        $stmt->bindParam(':id', $id);
    } else {
        $query = "UPDATE shipments SET 
                  shipping_status = :status 
                  WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':status', $data->shipping_status);
        $stmt->bindParam(':id', $id);
    }

    if ($stmt->execute()) {
        echo json_encode(["message" => "Shipment updated successfully."]);
    } else {
        http_response_code(500);
    }
}
?>
