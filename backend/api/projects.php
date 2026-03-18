<?php
// api/projects.php - Multi-Site Project Management

function get_project($id = null, $user_data = null) {
    if (!$user_data) {
        http_response_code(401);
        return;
    }

    $database = new Database();
    $db = $database->getConnection();

    if ($id) {
        $query = "SELECT * FROM projects WHERE id = :id";
        if ($user_data->role !== 'admin') {
            $query .= " AND user_id = :user_id";
        }
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $id);
        if ($user_data->role !== 'admin') {
            $stmt->bindParam(':user_id', $user_data->id);
        }
    } else {
        $query = "SELECT p.*, u.name as owner_name,
                  (SELECT COUNT(*) FROM orders o WHERE o.project_id = p.id) as order_count,
                  (SELECT COUNT(*) FROM shipments s WHERE s.project_id = p.id) as shipment_count
                  FROM projects p
                  JOIN users u ON p.user_id = u.id";
        if ($user_data->role !== 'admin') {
            $query .= " WHERE p.user_id = :user_id";
        }
        $query .= " ORDER BY p.created_at DESC";
        $stmt = $db->prepare($query);
        if ($user_data->role !== 'admin') {
            $stmt->bindParam(':user_id', $user_data->id);
        }
    }

    $stmt->execute();
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
}

function post_projects($id = null, $user_data = null) {
    if (!$user_data) {
        http_response_code(401);
        return;
    }

    $database = new Database();
    $db = $database->getConnection();
    $data = json_decode(file_get_contents("php://input"));

    if (empty($data->name)) {
        http_response_code(400);
        echo json_encode(["message" => "Project name is required."]);
        return;
    }

    $query = "INSERT INTO projects (user_id, name, description, site_location, project_status) 
              VALUES (:user_id, :name, :description, :site_location, :status)";
    $stmt = $db->prepare($query);
    
    $desc = $data->description ?? '';
    $loc = $data->site_location ?? '';
    $status = $data->project_status ?? 'active';

    $stmt->bindParam(':user_id', $user_data->id);
    $stmt->bindParam(':name', $data->name);
    $stmt->bindParam(':description', $desc);
    $stmt->bindParam(':site_location', $loc);
    $stmt->bindParam(':status', $status);

    if ($stmt->execute()) {
        http_response_code(201);
        echo json_encode(["message" => "Project created successfully.", "id" => $db->lastInsertId()]);
    } else {
        http_response_code(500);
    }
}

function put_projects($id = null, $user_data = null) {
    if (!$user_data || !$id) {
        http_response_code(401);
        return;
    }

    $database = new Database();
    $db = $database->getConnection();
    $data = json_decode(file_get_contents("php://input"));

    $query = "UPDATE projects SET 
              name = :name, 
              description = :description, 
              site_location = :site_location, 
              project_status = :status 
              WHERE id = :id";
    
    if ($user_data->role !== 'admin') {
        $query .= " AND user_id = :user_id";
    }

    $stmt = $db->prepare($query);
    $stmt->bindParam(':name', $data->name);
    $stmt->bindParam(':description', $data->description);
    $stmt->bindParam(':site_location', $data->site_location);
    $stmt->bindParam(':status', $data->project_status);
    $stmt->bindParam(':id', $id);
    
    if ($user_data->role !== 'admin') {
        $stmt->bindParam(':user_id', $user_data->id);
    }

    if ($stmt->execute()) {
        echo json_encode(["message" => "Project updated."]);
    } else {
        http_response_code(500);
    }
}
?>
