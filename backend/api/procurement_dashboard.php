<?php
// api/procurement_dashboard.php - Dealer Analytics

function get_procurement_dashboard($id = null, $user_data = null) {
    if (!$user_data || ($user_data->role !== 'dealer' && $user_data->role !== 'admin')) {
        http_response_code(403);
        echo json_encode(["message" => "Forbidden."]);
        return;
    }

    $database = new Database();
    $db = $database->getConnection();
    $target_user_id = ($user_data->role === 'admin' && $id) ? $id : $user_data->id;

    // 1. Total Procurement Spend (Paid Invoices)
    $query_spend = "SELECT SUM(total_amount) as total_spend FROM invoices WHERE user_id = :user_id AND status = 'paid'";
    $stmt_spend = $db->prepare($query_spend);
    $stmt_spend->bindParam(':user_id', $target_user_id);
    $stmt_spend->execute();
    $total_spend = $stmt_spend->fetch(PDO::FETCH_ASSOC)['total_spend'] ?? 0;

    // 2. RFQ Conversion Rate
    $query_rfq_total = "SELECT COUNT(*) as total FROM rfqs WHERE dealer_id = :user_id";
    $stmt_total = $db->prepare($query_rfq_total);
    $stmt_total->bindParam(':user_id', $target_user_id);
    $stmt_total->execute();
    $total_rfqs = $stmt_total->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;

    $query_rfq_success = "SELECT COUNT(*) as success FROM quotes q JOIN rfqs r ON q.rfq_id = r.id WHERE r.dealer_id = :user_id AND q.status = 'approved'";
    $stmt_success = $db->prepare($query_rfq_success);
    $stmt_success->bindParam(':user_id', $target_user_id);
    $stmt_success->execute();
    $success_rfqs = $stmt_success->fetch(PDO::FETCH_ASSOC)['success'] ?? 0;

    $conversion_rate = $total_rfqs > 0 ? round(($success_rfqs / $total_rfqs) * 100, 1) : 0;

    // 3. Asset Health Distribution
    $query_fleet = "SELECT status, COUNT(*) as count FROM fleet_assets WHERE dealer_id = :user_id GROUP BY status";
    $stmt_fleet = $db->prepare($query_fleet);
    $stmt_fleet->bindParam(':user_id', $target_user_id);
    $stmt_fleet->execute();
    $fleet_stats = $stmt_fleet->fetchAll(PDO::FETCH_ASSOC);

    // 4. Category-wise Spend
    $query_cat_spend = "SELECT c.name as category, SUM(i.total_amount) as spend 
                        FROM invoices i 
                        JOIN rfqs r ON i.rfq_id = r.id 
                        JOIN products p ON r.product_id = p.id 
                        JOIN categories c ON p.category_id = c.id
                        WHERE i.user_id = :user_id AND i.status = 'paid'
                        GROUP BY c.name";
    $stmt_cat = $db->prepare($query_cat_spend);
    $stmt_cat->bindParam(':user_id', $target_user_id);
    $stmt_cat->execute();
    $category_spend = $stmt_cat->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "total_spend" => (float)$total_spend,
        "conversion_rate" => (float)$conversion_rate,
        "fleet_stats" => $fleet_stats,
        "category_spend" => $category_spend,
        "rfq_metrics" => [
            "total" => (int)$total_rfqs,
            "approved" => (int)$success_rfqs
        ]
    ]);
}
?>
