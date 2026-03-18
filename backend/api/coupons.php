<?php
// GET /api/coupons - Get all coupons (admin)
// GET /api/coupons/{code} - Verify a coupon code (public)
function get_coupons($code = null, $user_data = null) {
    $database = new Database();
    $db = $database->getConnection();

    if ($code) {
        // Public: Verify a single coupon
        $query = "SELECT id, code, discount_type, discount_value, expiry_date FROM coupons WHERE code = :code AND expiry_date >= CURDATE() AND is_active = 1";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":code", $code);
        $stmt->execute();
        $num = $stmt->rowCount();

        if ($num > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            http_response_code(200);
            echo json_encode($row);
        } else {
            http_response_code(404);
            echo json_encode(array("message" => "Coupon not found, expired, or inactive."));
        }
    } else {
        // Admin: Get all coupons
        if (!$user_data || $user_data->role !== 'admin') {
            http_response_code(403);
            echo json_encode(array("message" => "Forbidden."));
            exit();
        }

        $query = "SELECT id, code, discount_type, discount_value, expiry_date, is_active FROM coupons ORDER BY created_at DESC";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $num = $stmt->rowCount();

        if ($num > 0) {
            $coupons_arr = array();
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                array_push($coupons_arr, $row);
            }
            http_response_code(200);
            echo json_encode($coupons_arr);
        } else {
            http_response_code(200);
            echo json_encode([]);
        }
    }
}

// POST /api/coupons - Create a new coupon (admin only)
function post_coupons($id = null, $user_data = null) {
    if (!$user_data || $user_data->role !== 'admin') {
        http_response_code(403);
        echo json_encode(array("message" => "Forbidden."));
        exit();
    }

    $database = new Database();
    $db = $database->getConnection();
    $data = json_decode(file_get_contents("php://input"));

    if (
        !empty($data->code) &&
        !empty($data->discount_type) &&
        isset($data->discount_value) &&
        !empty($data->expiry_date)
    ) {
        $query = "INSERT INTO coupons (code, discount_type, discount_value, expiry_date, is_active) VALUES (:code, :discount_type, :discount_value, :expiry_date, :is_active)";
        $stmt = $db->prepare($query);

        $code = htmlspecialchars(strip_tags($data->code));
        $discount_type = htmlspecialchars(strip_tags($data->discount_type));
        $discount_value = htmlspecialchars(strip_tags($data->discount_value));
        $expiry_date = htmlspecialchars(strip_tags($data->expiry_date));
        $is_active = isset($data->is_active) ? ($data->is_active ? 1 : 0) : 1;

        $stmt->bindParam(":code", $code);
        $stmt->bindParam(":discount_type", $discount_type);
        $stmt->bindParam(":discount_value", $discount_value);
        $stmt->bindParam(":expiry_date", $expiry_date);
        $stmt->bindParam(":is_active", $is_active);

        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode(array("message" => "Coupon was created."));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to create coupon. Code might already exist."));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Unable to create coupon. Data is incomplete."));
    }
}

// PUT /api/coupons/{id} - Update a coupon (admin only)
function put_coupons($id = null, $user_data = null) {
    if (!$user_data || $user_data->role !== 'admin' || !$id) {
        http_response_code(403);
        echo json_encode(array("message" => "Forbidden or missing ID."));
        exit();
    }

    $database = new Database();
    $db = $database->getConnection();
    $data = json_decode(file_get_contents("php://input"));

    if (
        !empty($data->code) &&
        !empty($data->discount_type) &&
        isset($data->discount_value) &&
        !empty($data->expiry_date)
    ) {
        $query = "UPDATE coupons SET code = :code, discount_type = :discount_type, discount_value = :discount_value, expiry_date = :expiry_date, is_active = :is_active WHERE id = :id";
        $stmt = $db->prepare($query);

        $code = htmlspecialchars(strip_tags($data->code));
        $discount_type = htmlspecialchars(strip_tags($data->discount_type));
        $discount_value = htmlspecialchars(strip_tags($data->discount_value));
        $expiry_date = htmlspecialchars(strip_tags($data->expiry_date));
        $is_active = isset($data->is_active) ? ($data->is_active ? 1 : 0) : 1;
        $id = htmlspecialchars(strip_tags($id));

        $stmt->bindParam(":code", $code);
        $stmt->bindParam(":discount_type", $discount_type);
        $stmt->bindParam(":discount_value", $discount_value);
        $stmt->bindParam(":expiry_date", $expiry_date);
        $stmt->bindParam(":is_active", $is_active);
        $stmt->bindParam(":id", $id);

        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(array("message" => "Coupon was updated."));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to update coupon."));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Unable to update coupon. Data is incomplete."));
    }
}

// DELETE /api/coupons/{id} - Delete a coupon (admin only)
function delete_coupons($id = null, $user_data = null) {
    if (!$user_data || $user_data->role !== 'admin' || !$id) {
        http_response_code(403);
        echo json_encode(array("message" => "Forbidden or missing ID."));
        exit();
    }

    $database = new Database();
    $db = $database->getConnection();

    $query = "DELETE FROM coupons WHERE id = :id";
    $stmt = $db->prepare($query);

    $id = htmlspecialchars(strip_tags($id));
    $stmt->bindParam(":id", $id);

    if ($stmt->execute()) {
        http_response_code(200);
        echo json_encode(array("message" => "Coupon was deleted."));
    } else {
        http_response_code(503);
        echo json_encode(array("message" => "Unable to delete coupon."));
    }
}
?>