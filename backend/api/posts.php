<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../core/functions.php';

function get_all_posts($id = null, $user_data = null) {
    $database = new Database();
    $db = $database->getConnection();

    $query = "SELECT * FROM posts ORDER BY created_at DESC";
    $stmt = $db->prepare($query);
    $stmt->execute();

    $posts = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $posts[] = $row;
    }
    
    http_response_code(200);
    echo json_encode($posts);
}

function get_post($id = null, $user_data = null) {
    $database = new Database();
    $db = $database->getConnection();

    if (is_numeric($id)) {
        $query = "SELECT * FROM posts WHERE id = :id";
    } else {
        $query = "SELECT * FROM posts WHERE slug = :id";
    }
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $id);
    $stmt->execute();

    $post = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($post) {
        http_response_code(200);
        echo json_encode($post);
    } else {
        http_response_code(404);
        echo json_encode(["message" => "Post not found."]);
    }
}

function create_post($id = null, $user_data = null) {
    if (!$user_data || $user_data->role !== 'admin') {
        http_response_code(403);
        echo json_encode(["message" => "Forbidden."]);
        return;
    }

    $database = new Database();
    $db = $database->getConnection();

    $title = $_POST['title'] ?? '';
    $slug = $_POST['slug'] ?? '';
    $content = $_POST['content'] ?? '';
    $excerpt = $_POST['excerpt'] ?? '';
    $is_active = (isset($_POST['is_active']) && ($_POST['is_active'] === 'true' || $_POST['is_active'] === '1')) ? 1 : 0;
    $featured_image = null;

    if (empty($slug) && !empty($title)) {
        $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $title)));
    }

    if (isset($_FILES['featured_image']) && $_FILES['featured_image']['error'] == UPLOAD_ERR_OK) {
        $upload_dir_fs = __DIR__ . '/../uploads/';
        $upload_dir_url = 'uploads/';
        if (!is_dir($upload_dir_fs)) {
            mkdir($upload_dir_fs, 0777, true);
        }
        $image_name = uniqid() . '-' . basename($_FILES['featured_image']['name']);
        $target_file_fs = $upload_dir_fs . $image_name;
        $featured_image = $upload_dir_url . $image_name;

        if (!move_uploaded_file($_FILES['featured_image']['tmp_name'], $target_file_fs)) {
            http_response_code(500);
            echo json_encode(["message" => "Failed to upload image."]);
            return;
        }
    }

    if (!empty($title) && !empty($slug)) {
        $query = "INSERT INTO posts (title, slug, content, excerpt, featured_image, is_active) VALUES (:title, :slug, :content, :excerpt, :featured_image, :is_active)";
        $stmt = $db->prepare($query);

        $stmt->bindParam(':title', $title);
        $stmt->bindParam(':slug', $slug);
        $stmt->bindParam(':content', $content);
        $stmt->bindParam(':excerpt', $excerpt);
        $stmt->bindParam(':featured_image', $featured_image);
        $stmt->bindParam(':is_active', $is_active, PDO::PARAM_INT);

        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode(["message" => "Post was created.", "id" => $db->lastInsertId()]);
        } else {
            http_response_code(503);
            echo json_encode(["message" => "Unable to create post."]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Unable to create post. Data is incomplete."]);
    }
}

function update_post($id = null, $user_data = null) {
    if (!$user_data || $user_data->role !== 'admin' || !$id) {
        http_response_code(403);
        echo json_encode(["message" => "Forbidden or missing ID."]);
        return;
    }

    $database = new Database();
    $db = $database->getConnection();

    $title = $_POST['title'] ?? '';
    $slug = $_POST['slug'] ?? '';
    $content = $_POST['content'] ?? '';
    $excerpt = $_POST['excerpt'] ?? '';
    $is_active = (isset($_POST['is_active']) && ($_POST['is_active'] === 'true' || $_POST['is_active'] === '1')) ? 1 : 0;

    $stmt = $db->prepare("SELECT featured_image FROM posts WHERE id = :id");
    $stmt->bindParam(':id', $id);
    $stmt->execute();
    $existing = $stmt->fetch(PDO::FETCH_ASSOC);
    $featured_image = $existing['featured_image'];

    if (isset($_FILES['featured_image']) && $_FILES['featured_image']['error'] == UPLOAD_ERR_OK) {
        $upload_dir_fs = __DIR__ . '/../uploads/';
        $upload_dir_url = 'uploads/';
        if (!is_dir($upload_dir_fs)) {
            mkdir($upload_dir_fs, 0777, true);
        }
        $image_name = uniqid() . '-' . basename($_FILES['featured_image']['name']);
        $target_file_fs = $upload_dir_fs . $image_name;
        $new_image_url = $upload_dir_url . $image_name;

        if (move_uploaded_file($_FILES['featured_image']['tmp_name'], $target_file_fs)) {
            $old_image_path = realpath($upload_dir_fs . basename($featured_image));
            if ($old_image_path && file_exists($old_image_path) && !is_dir($old_image_path)) {
                unlink($old_image_path);
            }
            $featured_image = $new_image_url;
        }
    }

    if (!empty($title) && !empty($slug)) {
        $query = "UPDATE posts SET title = :title, slug = :slug, content = :content, excerpt = :excerpt, featured_image = :featured_image, is_active = :is_active WHERE id = :id";
        $stmt = $db->prepare($query);

        $stmt->bindParam(':title', $title);
        $stmt->bindParam(':slug', $slug);
        $stmt->bindParam(':content', $content);
        $stmt->bindParam(':excerpt', $excerpt);
        $stmt->bindParam(':featured_image', $featured_image);
        $stmt->bindParam(':is_active', $is_active, PDO::PARAM_INT);
        $stmt->bindParam(':id', $id);

        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(["message" => "Post was updated."]);
        } else {
            http_response_code(503);
            echo json_encode(["message" => "Unable to update post."]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Unable to update post. Data is incomplete."]);
    }
}

function delete_post($id = null, $user_data = null) {
    if (!$user_data || $user_data->role !== 'admin' || !$id) {
        http_response_code(403);
        echo json_encode(["message" => "Forbidden or missing ID."]);
        return;
    }

    $database = new Database();
    $db = $database->getConnection();

    $stmt_img = $db->prepare("SELECT featured_image FROM posts WHERE id = :id");
    $stmt_img->bindParam(':id', $id);
    $stmt_img->execute();
    $post = $stmt_img->fetch(PDO::FETCH_ASSOC);

    $query = "DELETE FROM posts WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $id);

    if ($stmt->execute()) {
        if ($post && !empty($post['featured_image'])) {
            $upload_dir_fs = __DIR__ . '/../uploads/';
            $old_image_path = realpath($upload_dir_fs . basename($post['featured_image']));
            if ($old_image_path && file_exists($old_image_path) && !is_dir($old_image_path)) {
                unlink($old_image_path);
            }
        }
        http_response_code(200);
        echo json_encode(["message" => "Post was deleted."]);
    } else {
        http_response_code(503);
        echo json_encode(["message" => "Unable to delete post."]);
    }
}
?>
