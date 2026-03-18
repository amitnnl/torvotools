<?php
// api/credit.php - B2B Credit Management

function get_credit($id = null, $user_data = null) {
    if (!$user_data) {
        http_response_code(401);
        return;
    }

    $database = new Database();
    $db = $database->getConnection();

    if ($user_data->role === 'admin' && $id) {
        $query = "SELECT c.*, u.name, u.email FROM credit_accounts c JOIN users u ON c.user_id = u.id WHERE c.user_id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $id);
    } else {
        $query = "SELECT * FROM credit_accounts WHERE user_id = :user_id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':user_id', $user_data->id);
    }

    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($result) {
        echo json_encode($result);
    } else {
        echo json_encode(["credit_limit" => 0, "current_balance" => 0, "credit_status" => "none"]);
    }
}

function post_credit($id = null, $user_data = null) {
    if ($user_data->role !== 'admin') {
        http_response_code(403);
        return;
    }

    $database = new Database();
    $db = $database->getConnection();
    $data = json_decode(file_get_contents("php://input"));

    if (empty($data->user_id)) {
        http_response_code(400);
        return;
    }

    $query = "INSERT INTO credit_accounts (user_id, credit_limit, current_balance, credit_status) 
              VALUES (:user_id, :limit, :balance, :status) 
              ON DUPLICATE KEY UPDATE credit_limit = :limit, credit_status = :status";
    $stmt = $db->prepare($query);
    
    $limit = $data->credit_limit ?? 0;
    $balance = $data->current_balance ?? 0;
    $status = $data->credit_status ?? 'active';

    $stmt->bindParam(':user_id', $data->user_id);
    $stmt->bindParam(':limit', $limit);
    $stmt->bindParam(':balance', $balance);
    $stmt->bindParam(':status', $status);

    if ($stmt->execute()) {
        echo json_encode(["message" => "Credit profile updated."]);
    } else {
        http_response_code(500);
    }
}
?>
