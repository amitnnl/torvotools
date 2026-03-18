<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../core/functions.php';

function get_reviews($id = null, $user_data = null) {
    if (!$id) {
        http_response_code(400);
        echo json_encode(["message" => "Product ID is missing."]);
        return;
    }

    $database = new Database();
    $db = $database->getConnection();

    $query = "SELECT r.*, u.name as user_name 
              FROM reviews r 
              JOIN users u ON r.user_id = u.id 
              WHERE r.product_id = :product_id 
              ORDER BY r.created_at DESC";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':product_id', $id);
    $stmt->execute();

    $reviews = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $reviews[] = $row;
    }

    http_response_code(200);
    echo json_encode($reviews);
}

function post_reviews($id = null, $user_data = null) {
    if (!$user_data) {
        http_response_code(401);
        echo json_encode(["message" => "Unauthorized. Please login to leave a review."]);
        return;
    }

    $database = new Database();
    $db = $database->getConnection();
    $data = json_decode(file_get_contents("php://input"));

    if (!empty($data->product_id) && !empty($data->rating)) {
        // Validate rating
        if ($data->rating < 1 || $data->rating > 5) {
            http_response_code(400);
            echo json_encode(["message" => "Invalid rating. Must be between 1 and 5."]);
            return;
        }

        // Optional: Check if user already reviewed this product
        $check_query = "SELECT id FROM reviews WHERE user_id = :user_id AND product_id = :product_id";
        $check_stmt = $db->prepare($check_query);
        $check_stmt->bindParam(':user_id', $user_data->id);
        $check_stmt->bindParam(':product_id', $data->product_id);
        $check_stmt->execute();

        if ($check_stmt->rowCount() > 0) {
            http_response_code(400);
            echo json_encode(["message" => "You have already reviewed this product."]);
            return;
        }

        $query = "INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (:product_id, :user_id, :rating, :comment)";
        $stmt = $db->prepare($query);
        
        $comment = $data->comment ?? '';

        $stmt->bindParam(':product_id', $data->product_id);
        $stmt->bindParam(':user_id', $user_data->id);
        $stmt->bindParam(':rating', $data->rating);
        $stmt->bindParam(':comment', $comment);

        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode(["message" => "Review submitted successfully."]);
        } else {
            http_response_code(503);
            echo json_encode(["message" => "Unable to submit review."]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Unable to submit review. Data is incomplete."]);
    }
}
?>
