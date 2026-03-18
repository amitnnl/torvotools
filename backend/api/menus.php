<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../core/functions.php';

function get_all_menus($id = null, $user_data = null) {
    $database = new Database();
    $db = $database->getConnection();

    $query = "SELECT * FROM menus ORDER BY sort_order ASC";
    $stmt = $db->prepare($query);
    $stmt->execute();

    $menus = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $menus[] = $row;
    }
    
    http_response_code(200);
    echo json_encode($menus);
}

function get_menu($id = null, $user_data = null) {
    $database = new Database();
    $db = $database->getConnection();

    $query = "SELECT * FROM menus WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $id);
    $stmt->execute();

    $menu = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($menu) {
        http_response_code(200);
        echo json_encode($menu);
    } else {
        http_response_code(404);
        echo json_encode(["message" => "Menu not found."]);
    }
}

function create_menu($id = null, $user_data = null) {
    if (!$user_data || $user_data->role !== 'admin') {
        http_response_code(403);
        echo json_encode(["message" => "Forbidden."]);
        return;
    }

    $database = new Database();
    $db = $database->getConnection();

    $data = json_decode(file_get_contents("php://input"), true);
    if (!$data) $data = $_POST;

    $name = $data['name'] ?? '';
    $link = $data['link'] ?? '';
    $parent_id = !empty($data['parent_id']) ? $data['parent_id'] : null;

    if (!empty($name) && !empty($link)) {
        $query = "INSERT INTO menus (name, link, parent_id, sort_order) VALUES (:name, :link, :parent_id, 0)";
        $stmt = $db->prepare($query);

        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':link', $link);
        $stmt->bindParam(':parent_id', $parent_id);

        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode(["message" => "Menu item was created."]);
        } else {
            http_response_code(503);
            echo json_encode(["message" => "Unable to create menu item."]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Unable to create menu item. Data is incomplete."]);
    }
}

function update_menu($id = null, $user_data = null) {
    if (!$user_data || $user_data->role !== 'admin' || !$id) {
        http_response_code(403);
        echo json_encode(["message" => "Forbidden or missing ID."]);
        return;
    }

    $database = new Database();
    $db = $database->getConnection();

    $data = json_decode(file_get_contents("php://input"), true);
    if (!$data) $data = $_POST;

    $name = $data['name'] ?? '';
    $link = $data['link'] ?? '';
    $parent_id = !empty($data['parent_id']) ? $data['parent_id'] : null;

    if (!empty($name) && !empty($link)) {
        $query = "UPDATE menus SET name = :name, link = :link, parent_id = :parent_id WHERE id = :id";
        $stmt = $db->prepare($query);

        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':link', $link);
        $stmt->bindParam(':parent_id', $parent_id);
        $stmt->bindParam(':id', $id);

        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(["message" => "Menu item was updated."]);
        } else {
            http_response_code(503);
            echo json_encode(["message" => "Unable to update menu item."]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Unable to update menu item. Data is incomplete."]);
    }
}

function delete_menu($id = null, $user_data = null) {
    if (!$user_data || $user_data->role !== 'admin' || !$id) {
        http_response_code(403);
        echo json_encode(["message" => "Forbidden or missing ID."]);
        return;
    }

    $database = new Database();
    $db = $database->getConnection();

    $query = "DELETE FROM menus WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $id);

    if ($stmt->execute()) {
        http_response_code(200);
        echo json_encode(["message" => "Menu item was deleted."]);
    } else {
        http_response_code(503);
        echo json_encode(["message" => "Unable to delete menu item."]);
    }
}

function update_menu_order($id = null, $user_data = null) {
    if (!$user_data || $user_data->role !== 'admin') {
        http_response_code(403);
        echo json_encode(["message" => "Forbidden."]);
        return;
    }

    $database = new Database();
    $db = $database->getConnection();
    $data = json_decode(file_get_contents("php://input"));

    if (!empty($data->menus)) {
        try {
            $db->beginTransaction();
            foreach ($data->menus as $menu) {
                $query = "UPDATE menus SET sort_order = :sort_order WHERE id = :id";
                $stmt = $db->prepare($query);
                $stmt->bindParam(':sort_order', $menu->sort_order, PDO::PARAM_INT);
                $stmt->bindParam(':id', $menu->id, PDO::PARAM_INT);
                $stmt->execute();
            }
            $db->commit();
            http_response_code(200);
            echo json_encode(["message" => "Menu order updated."]);
        } catch (Exception $e) {
            $db->rollBack();
            http_response_code(503);
            echo json_encode(["message" => "Unable to update menu order."]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Data is incomplete."]);
    }
}
?>
