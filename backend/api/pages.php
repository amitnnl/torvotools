<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../core/functions.php';

function get_all_pages($id = null, $user_data = null) {
    $database = new Database();
    $db = $database->getConnection();

    $query = "SELECT * FROM pages ORDER BY title ASC";
    $stmt = $db->prepare($query);
    $stmt->execute();

    $pages = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $pages[] = $row;
    }
    
    http_response_code(200);
    echo json_encode($pages);
}

function get_page($id = null, $user_data = null) {
    $database = new Database();
    $db = $database->getConnection();

    if (is_numeric($id)) {
        $query = "SELECT * FROM pages WHERE id = :id";
    } else {
        $query = "SELECT * FROM pages WHERE slug = :id";
    }
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $id);
    $stmt->execute();

    $page = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($page) {
        http_response_code(200);
        echo json_encode($page);
    } else {
        http_response_code(404);
        echo json_encode(["message" => "Page not found."]);
    }
}

function create_page($id = null, $user_data = null) {
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
    $slug = $data['slug'] ?? '';
    $content = $data['content'] ?? '';
    $meta_description = $data['meta_description'] ?? '';
    $is_active = (isset($data['is_active']) && ($data['is_active'] === true || $data['is_active'] === 'true' || $data['is_active'] === 1 || $data['is_active'] === '1')) ? 1 : 0;

    if (empty($slug) && !empty($title)) {
        $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $title)));
    }

    if (!empty($title) && !empty($slug)) {
        $query = "INSERT INTO pages (title, slug, content, meta_description, is_active) VALUES (:title, :slug, :content, :meta_description, :is_active)";
        $stmt = $db->prepare($query);

        $stmt->bindParam(':title', $title);
        $stmt->bindParam(':slug', $slug);
        $stmt->bindParam(':content', $content);
        $stmt->bindParam(':meta_description', $meta_description);
        $stmt->bindParam(':is_active', $is_active, PDO::PARAM_INT);

        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode(["message" => "Page was created.", "id" => $db->lastInsertId()]);
        } else {
            http_response_code(503);
            echo json_encode(["message" => "Unable to create page."]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Unable to create page. Data is incomplete."]);
    }
}

function update_page($id = null, $user_data = null) {
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
    $slug = $data['slug'] ?? '';
    $content = $data['content'] ?? '';
    $meta_description = $data['meta_description'] ?? '';
    $is_active = (isset($data['is_active']) && ($data['is_active'] === true || $data['is_active'] === 'true' || $data['is_active'] === 1 || $data['is_active'] === '1')) ? 1 : 0;

    if (!empty($title) && !empty($slug)) {
        $query = "UPDATE pages SET title = :title, slug = :slug, content = :content, meta_description = :meta_description, is_active = :is_active WHERE id = :id";
        $stmt = $db->prepare($query);

        $stmt->bindParam(':title', $title);
        $stmt->bindParam(':slug', $slug);
        $stmt->bindParam(':content', $content);
        $stmt->bindParam(':meta_description', $meta_description);
        $stmt->bindParam(':is_active', $is_active, PDO::PARAM_INT);
        $stmt->bindParam(':id', $id);

        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(["message" => "Page was updated."]);
        } else {
            http_response_code(503);
            echo json_encode(["message" => "Unable to update page."]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Unable to update page. Data is incomplete."]);
    }
}

function delete_page($id = null, $user_data = null) {
    if (!$user_data || $user_data->role !== 'admin' || !$id) {
        http_response_code(403);
        echo json_encode(["message" => "Forbidden or missing ID."]);
        return;
    }

    $database = new Database();
    $db = $database->getConnection();

    $query = "DELETE FROM pages WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $id);

    if ($stmt->execute()) {
        http_response_code(200);
        echo json_encode(["message" => "Page was deleted."]);
    } else {
        http_response_code(503);
        echo json_encode(["message" => "Unable to delete page."]);
    }
}
?>
