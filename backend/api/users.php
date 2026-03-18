<?php
require_once 'config/database.php';
require_once 'core/functions.php';

function get_all_users($id = null, $user_data = null) {
    if (!$user_data || $user_data->role !== 'admin') {
        http_response_code(403);
        echo json_encode(["message" => "Forbidden. You don't have the required role."]);
        return;
    }

    $database = new Database();
    $db = $database->getConnection();

    $query = "SELECT id, name, email, role FROM users";
    $stmt = $db->prepare($query);
    $stmt->execute();

    $users = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $users[] = $row;
    }

    http_response_code(200);
    echo json_encode($users);
}

function get_user($id = null, $user_data = null) {
    if (!$user_data || $user_data->role !== 'admin') {
        http_response_code(403);
        echo json_encode(["message" => "Forbidden. You don't have the required role."]);
        return;
    }

    $database = new Database();
    $db = $database->getConnection();

    $query = "SELECT id, name, email, role FROM users WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $id);
    $stmt->execute();

    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        http_response_code(200);
        echo json_encode($user);
    } else {
        http_response_code(404);
        echo json_encode(["message" => "User not found."]);
    }
}

function create_user($id = null, $user_data = null) {
    if (!$user_data || $user_data->role !== 'admin') {
        http_response_code(403);
        echo json_encode(["message" => "Forbidden. You don't have the required role."]);
        return;
    }

    $database = new Database();
    $db = $database->getConnection();
    $data = json_decode(file_get_contents("php://input"));

    if (!empty($data->name) && !empty($data->email) && !empty($data->password) && !empty($data->role)) {
        $query = "INSERT INTO users (name, email, password, role) VALUES (:name, :email, :password, :role)";
        $stmt = $db->prepare($query);

        $name = htmlspecialchars(strip_tags($data->name));
        $email = htmlspecialchars(strip_tags($data->email));
        $password = password_hash($data->password, PASSWORD_BCRYPT);
        $role = htmlspecialchars(strip_tags($data->role));

        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':password', $password);
        $stmt->bindParam(':role', $role);

        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode(["message" => "User was created."]);
        } else {
            http_response_code(503);
            echo json_encode(["message" => "Unable to create user."]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Unable to create user. Data is incomplete."]);
    }
}

function update_user($id = null, $user_data = null) {
    if (!$user_data || $user_data->role !== 'admin') {
        http_response_code(403);
        echo json_encode(["message" => "Forbidden. You don't have the required role."]);
        return;
    }

    $database = new Database();
    $db = $database->getConnection();
    $data = json_decode(file_get_contents("php://input"));

    if (!empty($id) && !empty($data)) {
        // Check if we are demoting the last admin
        $query_check = "SELECT role FROM users WHERE id = :id";
        $stmt_check = $db->prepare($query_check);
        $stmt_check->bindParam(':id', $id);
        $stmt_check->execute();
        $current_user = $stmt_check->fetch(PDO::FETCH_ASSOC);

        if ($current_user && $current_user['role'] === 'admin' && $data->role !== 'admin') {
            $query_count = "SELECT COUNT(*) as admin_count FROM users WHERE role = 'admin'";
            $stmt_count = $db->prepare($query_count);
            $stmt_count->execute();
            $admin_count = $stmt_count->fetch(PDO::FETCH_ASSOC)['admin_count'];
            if ($admin_count <= 1) {
                http_response_code(400);
                echo json_encode(["message" => "Cannot demote the last admin."]);
                return;
            }
        }

        $query = "UPDATE users SET name = :name, email = :email, role = :role WHERE id = :id";
        $stmt = $db->prepare($query);

        $name = htmlspecialchars(strip_tags($data->name));
        $email = htmlspecialchars(strip_tags($data->email));
        $role = htmlspecialchars(strip_tags($data->role));
        $id = htmlspecialchars(strip_tags($id));

        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':role', $role);
        $stmt->bindParam(':id', $id);

        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(["message" => "User was updated."]);
        } else {
            http_response_code(503);
            echo json_encode(["message" => "Unable to update user."]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Unable to update user. Data is incomplete."]);
    }
}

function get_me($id = null, $user_data = null) {
    if (!$user_data) {
        http_response_code(401);
        echo json_encode(["message" => "Unauthorized."]);
        return;
    }

    $database = new Database();
    $db = $database->getConnection();

    $query = "SELECT id, name, email, role FROM users WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $user_data->id);
    $stmt->execute();

    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        if ($user['role'] === 'dealer') {
            $query_dealer = "SELECT * FROM dealer_details WHERE user_id = :user_id";
            $stmt_dealer = $db->prepare($query_dealer);
            $stmt_dealer->bindParam(':user_id', $user_data->id);
            $stmt_dealer->execute();
            $user['dealer_details'] = $stmt_dealer->fetch(PDO::FETCH_ASSOC);
        }
        http_response_code(200);
        echo json_encode($user);
    } else {
        http_response_code(404);
        echo json_encode(["message" => "User not found."]);
    }
}

function update_me($id = null, $user_data = null) {
    if (!$user_data) {
        http_response_code(401);
        echo json_encode(["message" => "Unauthorized."]);
        return;
    }

    $database = new Database();
    $db = $database->getConnection();
    $data = json_decode(file_get_contents("php://input"));

    if (!empty($data->name) && !empty($data->email)) {
        $db->beginTransaction();
        try {
            $query = "UPDATE users SET name = :name, email = :email WHERE id = :id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':name', $data->name);
            $stmt->bindParam(':email', $data->email);
            $stmt->bindParam(':id', $user_data->id);
            $stmt->execute();

            if ($user_data->role === 'dealer' && !empty($data->dealer_details)) {
                $query_dealer = "UPDATE dealer_details SET 
                                 company_name = :company_name, 
                                 gst_number = :gst_number, 
                                 address = :address 
                                 WHERE user_id = :user_id";
                $stmt_dealer = $db->prepare($query_dealer);
                $stmt_dealer->bindParam(':company_name', $data->dealer_details->company_name);
                $stmt_dealer->bindParam(':gst_number', $data->dealer_details->gst_number);
                $stmt_dealer->bindParam(':address', $data->dealer_details->address);
                $stmt_dealer->bindParam(':user_id', $user_data->id);
                $stmt_dealer->execute();
            }

            if (!empty($data->new_password)) {
                $password_hash = password_hash($data->new_password, PASSWORD_BCRYPT);
                $query_pass = "UPDATE users SET password = :password WHERE id = :id";
                $stmt_pass = $db->prepare($query_pass);
                $stmt_pass->bindParam(':password', $password_hash);
                $stmt_pass->bindParam(':id', $user_data->id);
                $stmt_pass->execute();
            }

            $db->commit();
            http_response_code(200);
            echo json_encode(["message" => "Profile updated successfully."]);
        } catch (Exception $e) {
            $db->rollBack();
            http_response_code(500);
            echo json_encode(["message" => "Failed to update profile: " . $e->getMessage()]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Name and Email are required."]);
    }
}

function delete_user($id = null, $user_data = null) {
    if (!$user_data || $user_data->role !== 'admin') {
        http_response_code(403);
        echo json_encode(["message" => "Forbidden. You don't have the required role."]);
        return;
    }

    $database = new Database();
    $db = $database->getConnection();

    if (!empty($id)) {
        // Check if we are deleting the last admin
        $query_check = "SELECT role FROM users WHERE id = :id";
        $stmt_check = $db->prepare($query_check);
        $stmt_check->bindParam(':id', $id);
        $stmt_check->execute();
        $user_to_delete = $stmt_check->fetch(PDO::FETCH_ASSOC);

        if ($user_to_delete && $user_to_delete['role'] === 'admin') {
            $query_count = "SELECT COUNT(*) as admin_count FROM users WHERE role = 'admin'";
            $stmt_count = $db->prepare($query_count);
            $stmt_count->execute();
            $admin_count = $stmt_count->fetch(PDO::FETCH_ASSOC)['admin_count'];
            if ($admin_count <= 1) {
                http_response_code(400);
                echo json_encode(["message" => "Cannot delete the last admin."]);
                return;
            }
        }

        $query = "DELETE FROM users WHERE id = :id";
        $stmt = $db->prepare($query);
        $id = htmlspecialchars(strip_tags($id));
        $stmt->bindParam(':id', $id);

        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(["message" => "User was deleted."]);
        } else {
            http_response_code(503);
            echo json_encode(["message" => "Unable to delete user."]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Unable to delete user. ID is missing."]);
    }
}

?>
