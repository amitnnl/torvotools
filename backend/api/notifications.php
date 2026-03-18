<?php
// api/notifications.php

function get_notifications($id = null, $user_data = null) {
    if (!$user_data) {
        http_response_code(401);
        echo json_encode(["message" => "Unauthorized."]);
        return;
    }

    $database = new Database();
    $db = $database->getConnection();

    // --- System Health Check: Maintenance Auto-Alert Logic ---
    if ($user_data->role === 'dealer') {
        // Find assets with next_service_date in the next 7 days
        $query_check = "SELECT id, serial_number, next_service_date FROM fleet_assets 
                        WHERE dealer_id = :dealer_id 
                        AND next_service_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
                        AND status != 'maintenance'";
        $stmt_check = $db->prepare($query_check);
        $stmt_check->bindParam(':dealer_id', $user_data->id);
        $stmt_check->execute();
        $due_assets = $stmt_check->fetchAll(PDO::FETCH_ASSOC);

        foreach ($due_assets as $asset) {
            $title = "Urgent: Maintenance Required";
            $message = "Asset SN: {$asset['serial_number']} is scheduled for service on {$asset['next_service_date']}. Please initiate technical audit.";
            
            // Check if notification already exists to avoid duplication
            $query_dup = "SELECT id FROM notifications WHERE user_id = :user_id AND title = :title AND message = :message AND is_read = 0";
            $stmt_dup = $db->prepare($query_dup);
            $stmt_dup->bindParam(':user_id', $user_data->id);
            $stmt_dup->bindParam(':title', $title);
            $stmt_dup->bindParam(':message', $message);
            $stmt_dup->execute();

            if (!$stmt_dup->fetch()) {
                $query_ins = "INSERT INTO notifications (user_id, title, message, type) VALUES (:user_id, :title, :message, 'warning')";
                $stmt_ins = $db->prepare($query_ins);
                $stmt_ins->bindParam(':user_id', $user_data->id);
                $stmt_ins->bindParam(':title', $title);
                $stmt_ins->bindParam(':message', $message);
                $stmt_ins->execute();
            }
        }
    }

    // Fetch notifications
    $query = "SELECT * FROM notifications WHERE user_id = :user_id ORDER BY created_at DESC LIMIT 50";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $user_data->id);
    $stmt->execute();
    $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($notifications);
}

function put_notifications($id = null, $user_data = null) {
    if (!$user_data || !$id) {
        http_response_code(400);
        return;
    }

    $database = new Database();
    $db = $database->getConnection();

    $query = "UPDATE notifications SET is_read = 1 WHERE id = :id AND user_id = :user_id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $id);
    $stmt->bindParam(':user_id', $user_data->id);
    
    if ($stmt->execute()) {
        echo json_encode(["message" => "Marked as read."]);
    } else {
        http_response_code(500);
    }
}
?>
