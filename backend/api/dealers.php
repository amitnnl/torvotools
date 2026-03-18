<?php
require_once 'config/database.php';
require_once 'core/functions.php';

function get_all_dealers($id = null, $user_data = null) {
    if (!$user_data || $user_data->role !== 'admin') {
        http_response_code(403);
        echo json_encode(["message" => "Forbidden. You don't have the required role."]);
        return;
    }

    $database = new Database();
    $db = $database->getConnection();

    $query = "SELECT u.id, u.name, u.email, d.gst_number, d.company_name, d.address, d.is_approved, d.tier 
              FROM users u 
              JOIN dealer_details d ON u.id = d.user_id 
              WHERE u.role = 'dealer'";
    $stmt = $db->prepare($query);
    $stmt->execute();

    $dealers = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $dealers[] = $row;
    }

    http_response_code(200);
    echo json_encode($dealers);
}

function get_dealer($id = null, $user_data = null) {
    if (!$user_data || $user_data->role !== 'admin') {
        http_response_code(403);
        echo json_encode(["message" => "Forbidden. You don't have the required role."]);
        return;
    }

    $database = new Database();
    $db = $database->getConnection();

    $query = "SELECT u.id, u.name, u.email, d.gst_number, d.company_name, d.address, d.is_approved, d.tier 
              FROM users u 
              JOIN dealer_details d ON u.id = d.user_id 
              WHERE u.role = 'dealer' AND u.id = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $id);
    $stmt->execute();

    $dealer = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($dealer) {
        http_response_code(200);
        echo json_encode($dealer);
    } else {
        http_response_code(404);
        echo json_encode(["message" => "Dealer not found."]);
    }
}

function create_dealer($id = null, $user_data = null) {
    if (!$user_data || $user_data->role !== 'admin') {
        http_response_code(403);
        echo json_encode(["message" => "Forbidden. You don't have the required role."]);
        return;
    }

    $database = new Database();
    $db = $database->getConnection();
    $data = json_decode(file_get_contents("php://input"));

    if (
        !empty($data->name) &&
        !empty($data->email) &&
        !empty($data->password) &&
        !empty($data->gst_number) &&
        !empty($data->company_name) &&
        !empty($data->address)
    ) {
        $db->beginTransaction();

        try {
            // Create user
            $query = "INSERT INTO users (name, email, password, role) VALUES (:name, :email, :password, 'dealer')";
            $stmt = $db->prepare($query);

            $name = htmlspecialchars(strip_tags($data->name));
            $email = htmlspecialchars(strip_tags($data->email));
            $password = password_hash($data->password, PASSWORD_BCRYPT);

            $stmt->bindParam(':name', $name);
            $stmt->bindParam(':email', $email);
            $stmt->bindParam(':password', $password);
            $stmt->execute();
            $user_id = $db->lastInsertId();

            // Create dealer details
            $query2 = "INSERT INTO dealer_details (user_id, gst_number, company_name, address, is_approved, tier) VALUES (:user_id, :gst_number, :company_name, :address, :is_approved, :tier)";
            $stmt2 = $db->prepare($query2);

            $gst_number = htmlspecialchars(strip_tags($data->gst_number));
            $company_name = htmlspecialchars(strip_tags($data->company_name));
            $address = htmlspecialchars(strip_tags($data->address));
            $is_approved = isset($data->is_approved) ? $data->is_approved : 0;
            $tier = isset($data->tier) ? $data->tier : 1;

            $stmt2->bindParam(':user_id', $user_id);
            $stmt2->bindParam(':gst_number', $gst_number);
            $stmt2->bindParam(':company_name', $company_name);
            $stmt2->bindParam(':address', $address);
            $stmt2->bindParam(':is_approved', $is_approved);
            $stmt2->bindParam(':tier', $tier);
            $stmt2->execute();

            $db->commit();
            http_response_code(201);
            echo json_encode(["message" => "Dealer was created."]);
        } catch (Exception $e) {
            $db->rollBack();
            http_response_code(503);
            echo json_encode(["message" => "Unable to create dealer. " . $e->getMessage()]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Unable to create dealer. Data is incomplete."]);
    }
}

function update_dealer($id = null, $user_data = null) {
    if (!$user_data || $user_data->role !== 'admin') {
        http_response_code(403);
        echo json_encode(["message" => "Forbidden. You don't have the required role."]);
        return;
    }

    $database = new Database();
    $db = $database->getConnection();
    $data = json_decode(file_get_contents("php://input"));

    if (!empty($id) && !empty($data)) {
        $db->beginTransaction();
        try {
            // Update users table
            $query1 = "UPDATE users SET name = :name, email = :email WHERE id = :id";
            $stmt1 = $db->prepare($query1);
            $stmt1->bindParam(':name', $data->name);
            $stmt1->bindParam(':email', $data->email);
            $stmt1->bindParam(':id', $id);
            $stmt1->execute();

            // Update dealer_details table
            $query2 = "UPDATE dealer_details SET gst_number = :gst_number, company_name = :company_name, address = :address, is_approved = :is_approved, tier = :tier WHERE user_id = :id";
            $stmt2 = $db->prepare($query2);
            $stmt2->bindParam(':gst_number', $data->gst_number);
            $stmt2->bindParam(':company_name', $data->company_name);
            $stmt2->bindParam(':address', $data->address);
            $stmt2->bindParam(':is_approved', $data->is_approved);
            $stmt2->bindParam(':tier', $data->tier);
            $stmt2->bindParam(':id', $id);
            $stmt2->execute();

            $db->commit();
            http_response_code(200);
            echo json_encode(["message" => "Dealer was updated."]);
        } catch (Exception $e) {
            $db->rollBack();
            http_response_code(503);
            echo json_encode(["message" => "Unable to update dealer. " . $e->getMessage()]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Unable to update dealer. Data is incomplete."]);
    }
}

function delete_dealer($id = null, $user_data = null) {
    if (!$user_data || $user_data->role !== 'admin') {
        http_response_code(403);
        echo json_encode(["message" => "Forbidden. You don't have the required role."]);
        return;
    }

    $database = new Database();
    $db = $database->getConnection();

    if (!empty($id)) {
        // The database schema uses ON DELETE CASCADE for the dealer_details table, 
        // so we only need to delete the user.
        $query = "DELETE FROM users WHERE id = :id AND role = 'dealer'";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $id);

        if ($stmt->execute()) {
            if ($stmt->rowCount() > 0) {
                http_response_code(200);
                echo json_encode(["message" => "Dealer was deleted."]);
            } else {
                http_response_code(404);
                echo json_encode(["message" => "Dealer not found or user is not a dealer."]);
            }
        } else {
            http_response_code(503);
            echo json_encode(["message" => "Unable to delete dealer."]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Unable to delete dealer. ID is missing."]);
    }
}

?>
