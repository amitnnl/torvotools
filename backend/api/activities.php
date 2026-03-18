<?php
function get_activities($id = null, $user_data = null) {
    if (!$user_data || $user_data->role !== 'admin') {
        http_response_code(403);
        echo json_encode(["message" => "Forbidden."]);
        return;
    }

    $database = new Database();
    $db = $database->getConnection();

    $activities = [];

    // 1. Recent Orders
    $q_orders = "SELECT 'order' as type, id, total_amount as title, created_at, 'new_order' as event FROM orders ORDER BY created_at DESC LIMIT 5";
    $st_orders = $db->prepare($q_orders);
    $st_orders->execute();
    while($row = $st_orders->fetch(PDO::FETCH_ASSOC)) {
        $row['description'] = "New order #TRV-" . $row['id'] . " received.";
        $activities[] = $row;
    }

    // 2. Recent RFQs
    $q_rfqs = "SELECT 'rfq' as type, r.id, p.name as title, r.created_at, 'new_rfq' as event 
               FROM rfqs r JOIN products p ON r.product_id = p.id 
               ORDER BY r.created_at DESC LIMIT 5";
    $st_rfqs = $db->prepare($q_rfqs);
    $st_rfqs->execute();
    while($row = $st_rfqs->fetch(PDO::FETCH_ASSOC)) {
        $row['description'] = "RFQ for " . $row['title'] . " submitted by dealer.";
        $activities[] = $row;
    }

    // 3. Recent Users
    $q_users = "SELECT 'user' as type, id, name as title, created_at, 'new_user' as event FROM users ORDER BY created_at DESC LIMIT 5";
    $st_users = $db->prepare($q_users);
    $st_users->execute();
    while($row = $st_users->fetch(PDO::FETCH_ASSOC)) {
        $row['description'] = "New " . $row['title'] . " joined the platform.";
        $activities[] = $row;
    }

    // 4. Recent Reviews
    $q_reviews = "SELECT 'review' as type, r.id, p.name as title, r.created_at, 'new_review' as event 
                  FROM reviews r JOIN products p ON r.product_id = p.id 
                  ORDER BY r.created_at DESC LIMIT 5";
    $st_reviews = $db->prepare($q_reviews);
    $st_reviews->execute();
    while($row = $st_reviews->fetch(PDO::FETCH_ASSOC)) {
        $row['description'] = "New technical review posted for " . $row['title'] . ".";
        $activities[] = $row;
    }

    // Sort all activities by created_at DESC
    usort($activities, function($a, $b) {
        return strtotime($b['created_at']) - strtotime($a['created_at']);
    });

    // Return top 10 combined
    $final_activities = array_slice($activities, 0, 10);

    http_response_code(200);
    echo json_encode($final_activities);
}
?>
