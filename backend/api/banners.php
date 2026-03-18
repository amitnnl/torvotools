<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../core/functions.php';

function get_all_banners($id = null, $user_data = null) {
    $database = new Database();
    $db = $database->getConnection();

    $query = "SELECT * FROM banners ORDER BY sort_order ASC";
    $stmt = $db->prepare($query);
    $stmt->execute();

    $banners = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $banners[] = $row;
    }
    
    http_response_code(200);
    echo json_encode($banners);
}

function get_banner($id = null, $user_data = null) {
    $database = new Database();
    $db = $database->getConnection();

    $query = "SELECT * FROM banners WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $id);
    $stmt->execute();

    $banner = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($banner) {
        http_response_code(200);
        echo json_encode($banner);
    } else {
        http_response_code(404);
        echo json_encode(["message" => "Banner not found."]);
    }
}

function create_banner($id = null, $user_data = null) {
    if (!$user_data || $user_data->role !== 'admin') {
        http_response_code(403);
        echo json_encode(["message" => "Forbidden. You don't have the required role."]);
        return;
    }

    $database = new Database();
    $db = $database->getConnection();
    
    $title = $_POST['title'] ?? '';
    $link = $_POST['link'] ?? '';
    $is_active = (isset($_POST['is_active']) && $_POST['is_active'] === 'true') ? 1 : 0;
    $image_url = null;

    if (isset($_FILES['image']) && $_FILES['image']['error'] == UPLOAD_ERR_OK) {
        $upload_dir_fs = __DIR__ . '/../uploads/';
        $upload_dir_url = 'uploads/';
        if (!is_dir($upload_dir_fs)) {
            mkdir($upload_dir_fs, 0777, true);
        }
        $image_name = uniqid() . '-' . basename($_FILES['image']['name']);
        $target_file_fs = $upload_dir_fs . $image_name;
        $image_url = $upload_dir_url . $image_name;

        if (!move_uploaded_file($_FILES['image']['tmp_name'], $target_file_fs)) {
            http_response_code(500);
            echo json_encode(["message" => "Failed to upload image."]);
            return;
        }
    }

    if (!empty($title)) {
        $query = "INSERT INTO banners (title, image_url, link, is_active, sort_order) VALUES (:title, :image_url, :link, :is_active, 0)";
        $stmt = $db->prepare($query);

        $stmt->bindParam(':title', $title);
        $stmt->bindParam(':image_url', $image_url);
        $stmt->bindParam(':link', $link);
        $stmt->bindParam(':is_active', $is_active, PDO::PARAM_INT);

        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode(["message" => "Banner was created."]);
        } else {
            http_response_code(503);
            echo json_encode(["message" => "Unable to create banner."]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Unable to create banner. Data is incomplete."]);
    }
}

function update_banner($id = null, $user_data = null) {
    if (!$user_data || $user_data->role !== 'admin' || !$id) {
        http_response_code(403);
        echo json_encode(["message" => "Forbidden or missing ID."]);
        return;
    }
    
    $database = new Database();
    $db = $database->getConnection();

    $title = $_POST['title'] ?? '';
    $link = $_POST['link'] ?? '';
    $is_active = (isset($_POST['is_active']) && $_POST['is_active'] === 'true') ? 1 : 0;

    $upload_dir_fs = __DIR__ . '/../uploads/';
    
    $stmt = $db->prepare("SELECT image_url FROM banners WHERE id = :id");
    $stmt->bindParam(':id', $id);
    $stmt->execute();
    $existing_banner = $stmt->fetch(PDO::FETCH_ASSOC);
    $image_url = $existing_banner['image_url'];

    if (isset($_FILES['image']) && $_FILES['image']['error'] == UPLOAD_ERR_OK) {
        $upload_dir_url = 'uploads/';
        if (!is_dir($upload_dir_fs)) {
            mkdir($upload_dir_fs, 0777, true);
        }
        $image_name = uniqid() . '-' . basename($_FILES['image']['name']);
        $target_file_fs = $upload_dir_fs . $image_name;
        $new_image_url = $upload_dir_url . $image_name;

        if (move_uploaded_file($_FILES['image']['tmp_name'], $target_file_fs)) {
            $old_image_path = realpath($upload_dir_fs . basename($image_url));
            if ($old_image_path && file_exists($old_image_path) && !is_dir($old_image_path)) {
                unlink($old_image_path);
            }
            $image_url = $new_image_url;
        } else {
            http_response_code(500);
            echo json_encode(["message" => "Failed to upload new image."]);
            return;
        }
    }

    if (!empty($title)) {
        $query = "UPDATE banners SET title = :title, image_url = :image_url, link = :link, is_active = :is_active WHERE id = :id";
        $stmt = $db->prepare($query);

        $stmt->bindParam(':title', $title);
        $stmt->bindParam(':image_url', $image_url);
        $stmt->bindParam(':link', $link);
        $stmt->bindParam(':is_active', $is_active, PDO::PARAM_INT);
        $stmt->bindParam(':id', $id);

        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(["message" => "Banner was updated."]);
        } else {
            http_response_code(503);
            echo json_encode(["message" => "Unable to update banner."]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Unable to update banner. Data is incomplete."]);
    }
}


function delete_banner($id = null, $user_data = null) {
    if (!$user_data || $user_data->role !== 'admin' || !$id) {
        http_response_code(403);
        echo json_encode(["message" => "Forbidden or missing ID."]);
        return;
    }

    $database = new Database();
    $db = $database->getConnection();

    $stmt_img = $db->prepare("SELECT image_url FROM banners WHERE id = :id");
    $stmt_img->bindParam(':id', $id);
    $stmt_img->execute();
    $banner = $stmt_img->fetch(PDO::FETCH_ASSOC);

    $query = "DELETE FROM banners WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $id);

    if ($stmt->execute()) {
        if ($banner && !empty($banner['image_url'])) {
            $upload_dir_fs = __DIR__ . '/../uploads/';
            $old_image_path = realpath($upload_dir_fs . basename($banner['image_url']));
            if ($old_image_path && file_exists($old_image_path) && !is_dir($old_image_path)) {
                unlink($old_image_path);
            }
        }
        http_response_code(200);
        echo json_encode(["message" => "Banner was deleted."]);
    } else {
        http_response_code(503);
        echo json_encode(["message" => "Unable to delete banner."]);
    }
}

function update_banner_order($id = null, $user_data = null) {
    if (!$user_data || $user_data->role !== 'admin') {
        http_response_code(403);
        echo json_encode(["message" => "Forbidden."]);
        return;
    }

    $database = new Database();
    $db = $database->getConnection();
    $data = json_decode(file_get_contents("php://input"));

    if (!empty($data->banners)) {
        try {
            $db->beginTransaction();
            foreach ($data->banners as $banner) {
                $query = "UPDATE banners SET sort_order = :sort_order WHERE id = :id";
                $stmt = $db->prepare($query);
                $stmt->bindParam(':sort_order', $banner->sort_order, PDO::PARAM_INT);
                $stmt->bindParam(':id', $banner->id, PDO::PARAM_INT);
                $stmt->execute();
            }
            $db->commit();
            http_response_code(200);
            echo json_encode(["message" => "Banner order updated."]);
        } catch (Exception $e) {
            $db->rollBack();
            http_response_code(503);
            echo json_encode(["message" => "Unable to update banner order."]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Data is incomplete."]);
    }
}
?>
