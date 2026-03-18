<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../core/functions.php';

function get_all_features($id = null, $user_data = null) {
    $database = new Database();
    $db = $database->getConnection();

    $query = "SELECT * FROM features ORDER BY sort_order ASC";
    $stmt = $db->prepare($query);
    $stmt->execute();

    $features = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $features[] = $row;
    }
    
    http_response_code(200);
    echo json_encode($features);
}

function get_feature($id = null, $user_data = null) {
    $database = new Database();
    $db = $database->getConnection();

    $query = "SELECT * FROM features WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $id);
    $stmt->execute();

    $feature = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($feature) {
        http_response_code(200);
        echo json_encode($feature);
    } else {
        http_response_code(404);
        echo json_encode(["message" => "Feature not found."]);
    }
}

function create_feature($id = null, $user_data = null) {
    if (!$user_data || $user_data->role !== 'admin') {
        http_response_code(403);
        echo json_encode(["message" => "Forbidden."]);
        return;
    }

    $database = new Database();
    $db = $database->getConnection();

    $data = json_decode(file_get_contents("php://input"), true);
    if (!$data) $data = $_POST;

    $title = $data['title'] ?? '';
    $description = $data['description'] ?? '';
    $icon = $data['icon'] ?? '';

    if (!empty($title)) {
        $query = "INSERT INTO features (title, description, icon, sort_order) VALUES (:title, :description, :icon, 0)";
        $stmt = $db->prepare($query);

        $stmt->bindParam(':title', $title);
        $stmt->bindParam(':description', $description);
        $stmt->bindParam(':icon', $icon);

        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode(["message" => "Feature was created."]);
        } else {
            http_response_code(503);
            echo json_encode(["message" => "Unable to create feature."]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Unable to create feature. Data is incomplete."]);
    }
}

function update_feature($id = null, $user_data = null) {
    if (!$user_data || $user_data->role !== 'admin' || !$id) {
        http_response_code(403);
        echo json_encode(["message" => "Forbidden or missing ID."]);
        return;
    }

    $database = new Database();
    $db = $database->getConnection();

    $data = json_decode(file_get_contents("php://input"), true);
    if (!$data) $data = $_POST;

    $title = $data['title'] ?? '';
    $description = $data['description'] ?? '';
    $icon = $data['icon'] ?? '';

    if (!empty($title)) {
        $query = "UPDATE features SET title = :title, description = :description, icon = :icon WHERE id = :id";
        $stmt = $db->prepare($query);

        $stmt->bindParam(':title', $title);
        $stmt->bindParam(':description', $description);
        $stmt->bindParam(':icon', $icon);
        $stmt->bindParam(':id', $id);

        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(["message" => "Feature was updated."]);
        } else {
            http_response_code(503);
            echo json_encode(["message" => "Unable to update feature."]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Unable to update feature. Data is incomplete."]);
    }
}

function delete_feature($id = null, $user_data = null) {
    if (!$user_data || $user_data->role !== 'admin' || !$id) {
        http_response_code(403);
        echo json_encode(["message" => "Forbidden or missing ID."]);
        return;
    }

    $database = new Database();
    $db = $database->getConnection();

    $query = "DELETE FROM features WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $id);

    if ($stmt->execute()) {
        http_response_code(200);
        echo json_encode(["message" => "Feature was deleted."]);
    } else {
        http_response_code(503);
        echo json_encode(["message" => "Unable to delete feature."]);
    }
}

function update_feature_order($id = null, $user_data = null) {
    if (!$user_data || $user_data->role !== 'admin') {
        http_response_code(403);
        echo json_encode(["message" => "Forbidden."]);
        return;
    }

    $database = new Database();
    $db = $database->getConnection();
    $data = json_decode(file_get_contents("php://input"));

    if (!empty($data->features)) {
        try {
            $db->beginTransaction();
            foreach ($data->features as $feature) {
                $query = "UPDATE features SET sort_order = :sort_order WHERE id = :id";
                $stmt = $db->prepare($query);
                $stmt->bindParam(':sort_order', $feature->sort_order, PDO::PARAM_INT);
                $stmt->bindParam(':id', $feature->id, PDO::PARAM_INT);
                $stmt->execute();
            }
            $db->commit();
            http_response_code(200);
            echo json_encode(["message" => "Feature order updated."]);
        } catch (Exception $e) {
            $db->rollBack();
            http_response_code(503);
            echo json_encode(["message" => "Unable to update feature order."]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Data is incomplete."]);
    }
}
?>
