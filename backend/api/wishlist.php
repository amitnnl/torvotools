<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../core/functions.php';

function get_wishlist($id = null, $user_data = null) {
    if (!$user_data) {
        http_response_code(401);
        echo json_encode(["message" => "Unauthorized."]);
        return;
    }

    $database = new Database();
    $db = $database->getConnection();

    $query = "SELECT p.*, c.name as category_name 
              FROM wishlists w 
              JOIN products p ON w.product_id = p.id 
              JOIN categories c ON p.category_id = c.id
              WHERE w.user_id = :user_id";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $user_data->id);
    $stmt->execute();

    $wishlist = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $wishlist[] = $row;
    }

    http_response_code(200);
    echo json_encode($wishlist);
}

function add_to_wishlist($id = null, $user_data = null) {
    if (!$user_data) {
        http_response_code(401);
        echo json_encode(["message" => "Unauthorized."]);
        return;
    }

    $database = new Database();
    $db = $database->getConnection();
    $data = json_decode(file_get_contents("php://input"));

    if (!empty($data->product_id)) {
        // Check if already in wishlist
        $check_query = "SELECT * FROM wishlists WHERE user_id = :user_id AND product_id = :product_id";
        $check_stmt = $db->prepare($check_query);
        $check_stmt->bindParam(':user_id', $user_data->id);
        $check_stmt->bindParam(':product_id', $data->product_id);
        $check_stmt->execute();

        if ($check_stmt->rowCount() > 0) {
            http_response_code(400);
            echo json_encode(["message" => "Product already in wishlist."]);
            return;
        }

        $query = "INSERT INTO wishlists (user_id, product_id) VALUES (:user_id, :product_id)";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':user_id', $user_data->id);
        $stmt->bindParam(':product_id', $data->product_id);

        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode(["message" => "Product added to wishlist."]);
        } else {
            http_response_code(503);
            echo json_encode(["message" => "Unable to add product to wishlist."]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Unable to add product. Product ID is missing."]);
    }
}

function remove_from_wishlist($id = null, $user_data = null) {
    if (!$user_data) {
        http_response_code(401);
        echo json_encode(["message" => "Unauthorized."]);
        return;
    }

    if (!$id) {
        http_response_code(400);
        echo json_encode(["message" => "Product ID is missing."]);
        return;
    }

    $database = new Database();
    $db = $database->getConnection();

    $query = "DELETE FROM wishlists WHERE user_id = :user_id AND product_id = :product_id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $user_data->id);
    $stmt->bindParam(':product_id', $id);

    if ($stmt->execute()) {
        http_response_code(200);
        echo json_encode(["message" => "Product removed from wishlist."]);
    } else {
        http_response_code(503);
        echo json_encode(["message" => "Unable to remove product from wishlist."]);
    }
}
?>
