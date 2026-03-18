<?php
// Function to get all brands
function get_all_brands($id = null, $user_data = null) {
    $database = new Database();
    $db = $database->getConnection();
    if ($db === null) { http_response_code(500); echo json_encode(["message" => "DB connection failed."]); return; }
    $query = "SELECT * FROM brands ORDER BY sort_order ASC";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $brands = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) { $brands[] = $row; }
    http_response_code(200);
    echo json_encode($brands);
}

// Function to get a single brand
function get_brand($id = null, $user_data = null) {
    $database = new Database();
    $db = $database->getConnection();
    if ($db === null) { http_response_code(500); echo json_encode(["message" => "DB connection failed."]); return; }
    $query = "SELECT * FROM brands WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $id);
    $stmt->execute();
    $brand = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($brand) { http_response_code(200); echo json_encode($brand); } 
    else { http_response_code(404); echo json_encode(["message" => "Brand not found."]); }
}

// Function to create a new brand
function create_brand($id = null, $user_data = null) {
    if (!$user_data || $user_data->role !== 'admin') {
        http_response_code(403);
        echo json_encode(["message" => "Forbidden."]);
        return;
    }

    $database = new Database();
    $db = $database->getConnection();
    
    $name = $_POST['name'] ?? '';
    $sort_order = $_POST['sort_order'] ?? 0;
    $logo_url = null;

    if (isset($_FILES['logo']) && $_FILES['logo']['error'] == UPLOAD_ERR_OK) {
        $upload_dir_fs = __DIR__ . '/../uploads/';
        $upload_dir_url = 'uploads/';
        if (!is_dir($upload_dir_fs)) {
            mkdir($upload_dir_fs, 0777, true);
        }
        $image_name = uniqid() . '-' . basename($_FILES['logo']['name']);
        $target_file_fs = $upload_dir_fs . $image_name;
        $logo_url = $upload_dir_url . $image_name;

        if (!move_uploaded_file($_FILES['logo']['tmp_name'], $target_file_fs)) {
            http_response_code(500);
            echo json_encode(["message" => "Failed to upload logo."]);
            return;
        }
    }

    if (!empty($name)) {
        $query = "INSERT INTO brands (name, logo_url, sort_order) VALUES (:name, :logo_url, :sort_order)";
        $stmt = $db->prepare($query);

        $stmt->bindParam(":name", $name);
        $stmt->bindParam(":logo_url", $logo_url);
        $stmt->bindParam(":sort_order", $sort_order, PDO::PARAM_INT);

        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode(["message" => "Brand was created."]);
        } else {
            http_response_code(503);
            echo json_encode(["message" => "Unable to create brand."]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Unable to create brand. Name is required."]);
    }
}

// Function to update a brand
function update_brand($id = null, $user_data = null) {
    if (!$user_data || $user_data->role !== 'admin' || !$id) {
        http_response_code(403);
        echo json_encode(["message" => "Forbidden or missing ID."]);
        return;
    }

    $database = new Database();
    $db = $database->getConnection();
    
    $name = $_POST['name'] ?? '';
    $sort_order = $_POST['sort_order'] ?? 0;
    
    $upload_dir_fs = __DIR__ . '/../uploads/';

    $stmt = $db->prepare("SELECT logo_url FROM brands WHERE id = :id");
    $stmt->bindParam(':id', $id);
    $stmt->execute();
    $existing_brand = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$existing_brand) {
        http_response_code(404);
        echo json_encode(["message" => "Brand not found."]);
        return;
    }
    $logo_url = $existing_brand['logo_url'];

    if (isset($_FILES['logo']) && $_FILES['logo']['error'] == UPLOAD_ERR_OK) {
        $upload_dir_url = 'uploads/';
        if (!is_dir($upload_dir_fs)) {
            mkdir($upload_dir_fs, 0777, true);
        }
        $image_name = uniqid() . '-' . basename($_FILES['logo']['name']);
        $target_file_fs = $upload_dir_fs . $image_name;
        $new_logo_url = $upload_dir_url . $image_name;

        if (move_uploaded_file($_FILES['logo']['tmp_name'], $target_file_fs)) {
            $old_logo_path = realpath($upload_dir_fs . basename($logo_url));
            if ($old_logo_path && file_exists($old_logo_path) && !is_dir($old_logo_path)) {
                unlink($old_logo_path);
            }
            $logo_url = $new_logo_url;
        } else {
            http_response_code(500);
            echo json_encode(["message" => "Failed to upload new logo."]);
            return;
        }
    }

    if (!empty($name)) {
        $query = "UPDATE brands SET name = :name, logo_url = :logo_url, sort_order = :sort_order WHERE id = :id";
        $stmt = $db->prepare($query);

        $stmt->bindParam(":name", $name);
        $stmt->bindParam(":logo_url", $logo_url);
        $stmt->bindParam(":sort_order", $sort_order, PDO::PARAM_INT);
        $stmt->bindParam(":id", $id);

        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(["message" => "Brand was updated."]);
        } else {
            http_response_code(503);
            echo json_encode(["message" => "Unable to update brand."]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Unable to update brand. Name is required."]);
    }
}

// Function to delete a brand
function delete_brand($id = null, $user_data = null) {
    if (!$user_data || $user_data->role !== 'admin' || !$id) {
        http_response_code(403);
        echo json_encode(["message" => "Forbidden or missing ID."]);
        return;
    }

    $database = new Database();
    $db = $database->getConnection();
    
    $stmt_logo = $db->prepare("SELECT logo_url FROM brands WHERE id = :id");
    $stmt_logo->bindParam(':id', $id);
    $stmt_logo->execute();
    $brand = $stmt_logo->fetch(PDO::FETCH_ASSOC);

    $query = "DELETE FROM brands WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":id", $id);

    if ($stmt->execute()) {
        if ($brand && !empty($brand['logo_url'])) {
            $upload_dir_fs = __DIR__ . '/../uploads/';
            $old_logo_path = realpath($upload_dir_fs . basename($brand['logo_url']));
            if ($old_logo_path && file_exists($old_logo_path) && !is_dir($old_logo_path)) {
                unlink($old_logo_path);
            }
        }
        http_response_code(200);
        echo json_encode(["message" => "Brand was deleted."]);
    } else {
        http_response_code(503);
        echo json_encode(["message" => "Unable to delete brand."]);
    }
}

// Function to update brand order
function update_brand_order($id = null, $user_data = null) {
    if (!$user_data || $user_data->role !== 'admin') {
        http_response_code(403);
        echo json_encode(["message" => "Forbidden."]);
        return;
    }
    $database = new Database();
    $db = $database->getConnection();
    $data = json_decode(file_get_contents("php://input"));
    if (!empty($data->brands)) {
        try {
            $db->beginTransaction();
            foreach ($data->brands as $brand) {
                $query = "UPDATE brands SET sort_order = :sort_order WHERE id = :id";
                $stmt = $db->prepare($query);
                $stmt->bindParam(':sort_order', $brand->sort_order, PDO::PARAM_INT);
                $stmt->bindParam(':id', $brand->id, PDO::PARAM_INT);
                $stmt->execute();
            }
            $db->commit();
            http_response_code(200);
            echo json_encode(["message" => "Brand order updated."]);
        } catch (Exception $e) {
            $db->rollBack();
            http_response_code(503);
            echo json_encode(["message" => "Unable to update brand order."]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Data is incomplete."]);
    }
}
?>
