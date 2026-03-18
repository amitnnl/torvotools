<?php
// api/inventory_prediction.php - AI-Driven Stock Forecasting

function get_inventory_prediction($id = null, $user_data = null) {
    if (!$user_data || ($user_data->role !== 'admin' && $user_data->role !== 'dealer')) {
        http_response_code(403);
        return;
    }

    $database = new Database();
    $db = $database->getConnection();

    // 1. Calculate Daily Burn Rate (last 90 days)
    $query = "SELECT oi.product_id, p.name, p.price,
              p.image_url as main_image,
              SUM(oi.quantity) as total_consumed, 
              (SUM(oi.quantity) / 90) as daily_burn_rate,
              inv.quantity as current_stock,
              inv.low_stock_threshold
              FROM order_items oi
              JOIN orders o ON oi.order_id = o.id
              JOIN products p ON oi.product_id = p.id
              JOIN inventory inv ON p.id = inv.product_id
              WHERE o.created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)
              AND o.status != 'cancelled'
              GROUP BY oi.product_id";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    $burn_data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 2. Fetch Active Projects for Surge Detection
    $proj_query = "SELECT p.id, p.name, p.site_location, p.project_status 
                   FROM projects p 
                   WHERE p.project_status = 'active'";
    $proj_stmt = $db->prepare($proj_query);
    $proj_stmt->execute();
    $active_projects = $proj_stmt->fetchAll(PDO::FETCH_ASSOC);

    $predictions = [];
    foreach ($burn_data as $row) {
        $daily_rate = (float)$row['daily_burn_rate'];
        $stock = (int)$row['current_stock'];
        
        $days_left = $daily_rate > 0 ? floor($stock / $daily_rate) : 999;
        
        // Project Surge Multiplier
        // We look for orders linked to this product within active projects
        $surge_query = "SELECT COUNT(*) as surge_count 
                        FROM orders o 
                        JOIN order_items oi ON o.id = oi.order_id 
                        WHERE oi.product_id = :pid AND o.project_id IS NOT NULL";
        $surge_stmt = $db->prepare($surge_query);
        $surge_stmt->bindParam(':pid', $row['product_id']);
        $surge_stmt->execute();
        $surge_data = $surge_stmt->fetch(PDO::FETCH_ASSOC);
        $surge_factor = $surge_data['surge_count'] > 5 ? 1.5 : 1.0;
        $daily_rate_surge = $daily_rate * $surge_factor;
        $adjusted_days_left = floor($days_left / $surge_factor);

        $predictions[] = [
            "id" => $row['product_id'],
            "product_id" => $row['product_id'],
            "name" => $row['name'],
            "price" => $row['price'],
            "image" => $row['main_image'],
            "current_stock" => $stock,
            "daily_burn_rate" => round($daily_rate_surge, 2),
            "days_until_stockout" => $adjusted_days_left,
            "prediction_confidence" => min(100, (int)$row['total_consumed'] * 2),
            "risk_level" => ($adjusted_days_left < 15) ? 'CRITICAL' : (($adjusted_days_left < 45) ? 'WARNING' : 'STABLE'),
            "recommended_restock_date" => date('Y-m-d', strtotime("+$adjusted_days_left days - 7 days")),
            "recommended_quantity" => ceil($daily_rate_surge * 30),
            "surge_detected" => ($surge_factor > 1.0)
        ];
    }

    // Sort by most critical
    usort($predictions, function($a, $b) {
        return $a['days_until_stockout'] <=> $b['days_until_stockout'];
    });

    echo json_encode($predictions);
}
?>
