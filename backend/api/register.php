<?php
function post_register($id = null, $user_data = null) {
    $database = new Database();
    $db = $database->getConnection();

    $data = json_decode(file_get_contents("php://input"));

    if (
        !empty($data->name) &&
        !empty($data->email) &&
        !empty($data->password) &&
        !empty($data->role) &&
        in_array($data->role, ['customer', 'dealer'])
    ) {
        $query = "INSERT INTO users (name, email, password, role) VALUES (:name, :email, :password, :role)";
        $stmt = $db->prepare($query);

        $name = htmlspecialchars(strip_tags($data->name));
        $email = htmlspecialchars(strip_tags($data->email));
        $password = password_hash($data->password, PASSWORD_BCRYPT);
        $role = htmlspecialchars(strip_tags($data->role));

        $stmt->bindParam(":name", $name);
        $stmt->bindParam(":email", $email);
        $stmt->bindParam(":password", $password);
        $stmt->bindParam(":role", $role);

        if ($stmt->execute()) {
            $user_id = $db->lastInsertId();

            if ($data->role == 'dealer') {
                if (
                    !empty($data->gst_number) &&
                    !empty($data->company_name) &&
                    !empty($data->address)
                ) {
                    $query_dealer = "INSERT INTO dealer_details (user_id, gst_number, company_name, address) VALUES (:user_id, :gst_number, :company_name, :address)";
                    $stmt_dealer = $db->prepare($query_dealer);

                    $gst_number = htmlspecialchars(strip_tags($data->gst_number));
                    $company_name = htmlspecialchars(strip_tags($data->company_name));
                    $address = htmlspecialchars(strip_tags($data->address));

                    $stmt_dealer->bindParam(":user_id", $user_id);
                    $stmt_dealer->bindParam(":gst_number", $gst_number);
                    $stmt_dealer->bindParam(":company_name", $company_name);
                    $stmt_dealer->bindParam(":address", $address);

                    if ($stmt_dealer->execute()) {
                        http_response_code(201);
                        echo json_encode(array("message" => "Dealer was successfully registered. awaiting for approval"));
                    } else {
                        http_response_code(503);
                        echo json_encode(array("message" => "Unable to register the dealer details."));
                    }
                } else {
                    http_response_code(400);
                    echo json_encode(array("message" => "Unable to register user. Incomplete dealer information."));
                }
            } else {
                http_response_code(201);
                echo json_encode(array("message" => "User was successfully registered."));
            }
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to register the user."));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Unable to register user. Data is incomplete."));
    }
}
?>