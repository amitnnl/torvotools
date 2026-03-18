<?php
// api/fleet.php - Fleet Management for Dealers

function get_fleet($id = null, $user_data = null) {
    if (!$user_data || $user_data->role !== 'dealer') {
        http_response_code(403);
        echo json_encode(["message" => "Forbidden."]);
        return;
    }

    $database = new Database();
    $db = $database->getConnection();

    if ($id) {
        $query = "SELECT f.*, p.name as product_name, p.image_url 
                  FROM fleet_assets f 
                  JOIN products p ON f.product_id = p.id 
                  WHERE f.id = :id AND f.dealer_id = :dealer_id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->bindParam(':dealer_id', $user_data->id);
    } else {
        $query = "SELECT f.*, p.name as product_name, p.thumbnail_url 
                  FROM fleet_assets f 
                  JOIN products p ON f.product_id = p.id 
                  WHERE f.dealer_id = :dealer_id 
                  ORDER BY f.created_at DESC";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':dealer_id', $user_data->id);
    }

    $stmt->execute();
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    http_response_code(200);
    echo json_encode($results);
}

function post_fleet($id = null, $user_data = null) {
    if (!$user_data || $user_data->role !== 'dealer') {
        http_response_code(403);
        echo json_encode(["message" => "Forbidden."]);
        return;
    }

    $database = new Database();
    $db = $database->getConnection();
    $data = json_decode(file_get_contents("php://input"));

    if (!empty($data->product_id) && !empty($data->serial_number)) {
        $query = "INSERT INTO fleet_assets (dealer_id, product_id, serial_number, status, site_location, notes) 
                  VALUES (:dealer_id, :product_id, :serial_number, :status, :site_location, :notes)";
        $stmt = $db->prepare($query);

        $status = $data->status ?? 'active';
        $site_location = $data->site_location ?? '';
        $notes = $data->notes ?? '';

        $stmt->bindParam(':dealer_id', $user_data->id);
        $stmt->bindParam(':product_id', $data->product_id);
        $stmt->bindParam(':serial_number', $data->serial_number);
        $stmt->bindParam(':status', $status);
        $stmt->bindParam(':site_location', $site_location);
        $stmt->bindParam(':notes', $notes);

        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode(["message" => "Asset added to fleet.", "id" => $db->lastInsertId()]);
        } else {
            http_response_code(500);
            echo json_encode(["message" => "Unable to add asset."]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Incomplete data."]);
    }
}

function put_fleet($id = null, $user_data = null) {
    if (!$user_data || $user_data->role !== 'dealer') {
        http_response_code(403);
        echo json_encode(["message" => "Forbidden."]);
        return;
    }

    $database = new Database();
    $db = $database->getConnection();
    $data = json_decode(file_get_contents("php://input"));

    if (!$id) {
        http_response_code(400);
        echo json_encode(["message" => "ID required."]);
        return;
    }

    $query = "UPDATE fleet_assets SET 
              status = :status, 
              site_location = :site_location, 
              last_service_date = :last_service_date,
              next_service_date = :next_service_date,
              notes = :notes 
              WHERE id = :id AND dealer_id = :dealer_id";
    $stmt = $db->prepare($query);

    $stmt->bindParam(':status', $data->status);
    $stmt->bindParam(':site_location', $data->site_location);
    $stmt->bindParam(':last_service_date', $data->last_service_date);
    $stmt->bindParam(':next_service_date', $data->next_service_date);
    $stmt->bindParam(':notes', $data->notes);
    $stmt->bindParam(':id', $id);
    $stmt->bindParam(':dealer_id', $user_data->id);

    if ($stmt->execute()) {
        echo json_encode(["message" => "Asset updated."]);
    } else {
        http_response_code(500);
        echo json_encode(["message" => "Update failed."]);
    }
}
