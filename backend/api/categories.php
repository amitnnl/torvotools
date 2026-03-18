<?php
function get_all_categories($id = null, $user_data = null) {
    $database = new Database();
    $db = $database->getConnection();
    $query = "SELECT id, name, parent_id, image_url FROM categories ORDER BY name ASC";
    $stmt = $db->prepare($query);
    $stmt->execute();

    $categories_arr = array();
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $categories_arr[] = $row;
    }
    http_response_code(200);
    echo json_encode($categories_arr);
}

function get_category($id = null, $user_data = null) {
    $database = new Database();
    $db = $database->getConnection();
    $query = "SELECT id, name, parent_id, image_url FROM categories WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":id", $id);
    $stmt->execute();

    $category = $stmt->fetch(PDO::FETCH_ASSOC);
    http_response_code(200);
    echo json_encode($category);
}

function create_category($id = null, $user_data = null) {
    if (!$user_data || $user_data->role !== 'admin') {
        http_response_code(403);
        echo json_encode(["message" => "Forbidden. You don't have the required role."]);
        return;
    }
    $database = new Database();
    $db = $database->getConnection();
    
    $name = $_POST['name'] ?? '';
    $parent_id = ($_POST['parent_id'] ?? null);
    if ($parent_id === 'null' || $parent_id === '') {
        $parent_id = null;
    }
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

    if (!empty($name)) {
        $query = "INSERT INTO categories (name, parent_id, image_url) VALUES (:name, :parent_id, :image_url)";
        $stmt = $db->prepare($query);

        $stmt->bindParam(":name", $name);
        $stmt->bindParam(":parent_id", $parent_id);
        $stmt->bindParam(":image_url", $image_url);

        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode(array("message" => "Category was created."));
        } else {
            $errorInfo = $stmt->errorInfo();
            error_log("DB Error in create_category: " . print_r($errorInfo, true));
            http_response_code(500);
            echo json_encode(array("message" => "Unable to create category. DB Error: " . ($errorInfo[2] ?? 'Unknown error')));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Unable to create category. Data is incomplete."));
    }
}

function update_category($id = null, $user_data = null) {
    if (!$user_data || $user_data->role !== 'admin') {
        http_response_code(403);
        echo json_encode(["message" => "Forbidden. You don't have the required role."]);
        return;
    }
    if (!$id) {
        http_response_code(400);
        echo json_encode(array("message" => "No category ID provided."));
        return;
    }

    $database = new Database();
    $db = $database->getConnection();
    
    $name = $_POST['name'] ?? '';
    $parent_id = ($_POST['parent_id'] ?? null);
    if ($parent_id === 'null' || $parent_id === '') {
        $parent_id = null;
    }
    
    $upload_dir_fs = __DIR__ . '/../uploads/';

    $stmt = $db->prepare("SELECT image_url FROM categories WHERE id = :id");
    $stmt->bindParam(':id', $id);
    $stmt->execute();
    $existing_category = $stmt->fetch(PDO::FETCH_ASSOC);
    $image_url = $existing_category['image_url'];

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

    if (!empty($name)) {
        $query = "UPDATE categories SET name = :name, parent_id = :parent_id, image_url = :image_url WHERE id = :id";
        $stmt = $db->prepare($query);

        $stmt->bindParam(":name", $name);
        $stmt->bindParam(":parent_id", $parent_id);
        $stmt->bindParam(":image_url", $image_url);
        $stmt->bindParam(":id", $id);

        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(array("message" => "Category was updated."));
        } else {
            $errorInfo = $stmt->errorInfo();
            error_log("DB Error in update_category: " . print_r($errorInfo, true));
            http_response_code(500);
            echo json_encode(array("message" => "Unable to update category. DB Error: " . ($errorInfo[2] ?? 'Unknown error')));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Unable to update category. Data is incomplete."));
    }
}

function delete_category($id = null, $user_data = null) {
    if (!$user_data || $user_data->role !== 'admin') {
        http_response_code(403);
        echo json_encode(["message" => "Forbidden. You don't have the required role."]);
        return;
    }
    if (!$id) {
        http_response_code(400);
        echo json_encode(array("message" => "No category ID provided."));
        return;
    }

    $database = new Database();
    $db = $database->getConnection();
    
    // First, find the image_url to delete the file
    $stmt_img = $db->prepare("SELECT image_url FROM categories WHERE id = :id");
    $stmt_img->bindParam(':id', $id);
    $stmt_img->execute();
    $category = $stmt_img->fetch(PDO::FETCH_ASSOC);
    
    $query = "DELETE FROM categories WHERE id = :id";
    $stmt = $db->prepare($query);

    $id_sanitized = htmlspecialchars(strip_tags($id));
    $stmt->bindParam(":id", $id_sanitized);

    if ($stmt->execute()) {
        if ($category && !empty($category['image_url'])) {
            $upload_dir_fs = __DIR__ . '/../uploads/';
            $old_image_path = realpath($upload_dir_fs . basename($category['image_url']));
            if ($old_image_path && file_exists($old_image_path) && !is_dir($old_image_path)) {
                unlink($old_image_path);
            }
        }
        http_response_code(200);
        echo json_encode(array("message" => "Category was deleted."));
    } else {
        http_response_code(503);
        echo json_encode(array("message" => "Unable to delete category. It might be in use by products."));
    }
}
?>