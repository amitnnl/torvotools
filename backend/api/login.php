<?php
use JWT\JWT;

function post_login($id = null, $user_data = null) {
    $database = new Database();
    $db = $database->getConnection();

    $data = json_decode(file_get_contents("php://input"));

    if (!empty($data->email) && !empty($data->password)) {
        $query = "SELECT id, name, email, password, role FROM users WHERE email = :email";
        $stmt = $db->prepare($query);

        $email = htmlspecialchars(strip_tags($data->email));
        $stmt->bindParam(":email", $email);
        $stmt->execute();

        $num = $stmt->rowCount();

        if ($num > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            $id = $row['id'];
            $name = $row['name'];
            $password2 = $row['password'];
            $role = $row['role'];

            // Fetch tier if dealer
            $tier = null;
            if ($role === 'dealer') {
                $query_tier = "SELECT tier FROM dealer_details WHERE user_id = :user_id";
                $stmt_tier = $db->prepare($query_tier);
                $stmt_tier->bindParam(":user_id", $id);
                $stmt_tier->execute();
                $tier_row = $stmt_tier->fetch(PDO::FETCH_ASSOC);
                $tier = $tier_row ? (int)$tier_row['tier'] : 1;
            }

            if (password_verify($data->password, $password2)) {
                $secret_key = JWT_SECRET;
                $issuer_claim = "localhost";
                $audience_claim = "localhost";
                $issuedat_claim = time();
                $notbefore_claim = $issuedat_claim;
                $expire_claim = $issuedat_claim + 86400; // 24 hours

                $token = array(
                    "iss" => $issuer_claim,
                    "aud" => $audience_claim,
                    "iat" => $issuedat_claim,
                    "nbf" => $notbefore_claim,
                    "exp" => $expire_claim,
                    "data" => array(
                        "id" => $id,
                        "name" => $name,
                        "email" => $email,
                        "role" => $role,
                        "tier" => $tier
                    )
                );

                http_response_code(200);
                $jwt = JWT::encode($token, $secret_key, 'HS256');
                echo json_encode(
                    array(
                        "message" => "Successful login.",
                        "jwt" => $jwt,
                        "email" => $email,
                        "expireAt" => $expire_claim
                    )
                );
            } else {
                http_response_code(401);
                echo json_encode(array("message" => "Login failed. Incorrect password."));
            }
        } else {
            http_response_code(401);
            echo json_encode(array("message" => "Login failed. User not found."));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Login failed. Data is incomplete."));
    }
}
?>