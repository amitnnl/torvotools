<?php
function get_analytics($id = null, $user_data = null) {
    if (!$user_data || $user_data->role !== 'admin') {
        http_response_code(403);
        echo json_encode(["message" => "Forbidden. You don't have the required role."]);
        return;
    }

    $database = new Database();
    $db = $database->getConnection();

    // Total Sales
    $query_sales = "SELECT SUM(total_amount) as total_sales FROM orders WHERE status != 'cancelled'";
    $stmt_sales = $db->prepare($query_sales);
    $stmt_sales->execute();
    $total_sales = $stmt_sales->fetch(PDO::FETCH_ASSOC)['total_sales'];

    // Average Order Value
    $query_aov = "SELECT AVG(total_amount) as avg_order_value FROM orders WHERE status != 'cancelled'";
    $stmt_aov = $db->prepare($query_aov);
    $stmt_aov->execute();
    $avg_order_value = $stmt_aov->fetch(PDO::FETCH_ASSOC)['avg_order_value'];

    // Total Orders
    $query_orders = "SELECT COUNT(*) as total_orders FROM orders WHERE status != 'cancelled'";
    $stmt_orders = $db->prepare($query_orders);
    $stmt_orders->execute();
    $total_orders = $stmt_orders->fetch(PDO::FETCH_ASSOC)['total_orders'];

    // Total Users
    $query_users = "SELECT COUNT(*) as total_users FROM users";
    $stmt_users = $db->prepare($query_users);
    $stmt_users->execute();
    $total_users = $stmt_users->fetch(PDO::FETCH_ASSOC)['total_users'];
    
    // Sales Over Time (Last 30 days)
    $query_sales_over_time = "SELECT DATE(created_at) as date, SUM(total_amount) as daily_sales FROM orders WHERE status != 'cancelled' AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) GROUP BY DATE(created_at) ORDER BY DATE(created_at)";
    $stmt_sales_over_time = $db->prepare($query_sales_over_time);
    $stmt_sales_over_time->execute();
    $sales_over_time = $stmt_sales_over_time->fetchAll(PDO::FETCH_ASSOC);

    // Top 5 Selling Products by quantity
    $query_top_selling = "SELECT p.name, SUM(oi.quantity) as total_quantity_sold 
                          FROM order_items oi
                          JOIN products p ON oi.product_id = p.id
                          GROUP BY p.name
                          ORDER BY total_quantity_sold DESC
                          LIMIT 5";
    $stmt_top_selling = $db->prepare($query_top_selling);
    $stmt_top_selling->execute();
    $top_selling_products = $stmt_top_selling->fetchAll(PDO::FETCH_ASSOC);

    // Top 5 Most Ordered Products by number of orders
    $query_most_ordered = "SELECT p.name, COUNT(DISTINCT oi.order_id) as total_orders_count
                           FROM order_items oi
                           JOIN products p ON oi.product_id = p.id
                           GROUP BY p.name
                           ORDER BY total_orders_count DESC
                           LIMIT 5";
    $stmt_most_ordered = $db->prepare($query_most_ordered);
    $stmt_most_ordered->execute();
    $most_ordered_products = $stmt_most_ordered->fetchAll(PDO::FETCH_ASSOC);

    // New customers in the last 30 days
    $query_new_customers = "SELECT COUNT(*) as new_customers FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
    $stmt_new_customers = $db->prepare($query_new_customers);
    $stmt_new_customers->execute();
    $new_customers_last_30_days = $stmt_new_customers->fetch(PDO::FETCH_ASSOC)['new_customers'];

    // Repeat purchase rate
    $query_repeat_customers = "SELECT COUNT(user_id) as repeat_customers FROM (SELECT user_id, COUNT(id) as order_count FROM orders WHERE status != 'cancelled' GROUP BY user_id HAVING order_count > 1) as customer_orders";
    $stmt_repeat_customers = $db->prepare($query_repeat_customers);
    $stmt_repeat_customers->execute();
    $repeat_customers = $stmt_repeat_customers->fetch(PDO::FETCH_ASSOC)['repeat_customers'];
    $total_customers_with_orders = $db->query("SELECT COUNT(DISTINCT user_id) FROM orders WHERE status != 'cancelled'")->fetchColumn();
    $repeat_purchase_rate = $total_customers_with_orders > 0 ? ($repeat_customers / $total_customers_with_orders) * 100 : 0;

    // Low Stock Alert
    $query_low_stock = "SELECT p.name, i.quantity, i.low_stock_threshold 
                        FROM inventory i 
                        JOIN products p ON i.product_id = p.id 
                        WHERE i.quantity <= i.low_stock_threshold";
    $stmt_low_stock = $db->prepare($query_low_stock);
    $stmt_low_stock->execute();
    $low_stock_products = $stmt_low_stock->fetchAll(PDO::FETCH_ASSOC);

    // B2B METRICS
    // Total Credit Exposure
    $query_credit = "SELECT SUM(credit_limit) as total_limit, SUM(current_balance) as total_exposure FROM credit_accounts";
    $stmt_credit = $db->prepare($query_credit);
    $stmt_credit->execute();
    $credit_stats = $stmt_credit->fetch(PDO::FETCH_ASSOC);

    // Active Projects
    $active_projects = $db->query("SELECT COUNT(*) FROM projects WHERE project_status = 'active'")->fetchColumn();

    // Shipments in flight
    $in_flight = $db->query("SELECT COUNT(*) FROM shipments WHERE shipping_status NOT IN ('delivered', 'cancelled')")->fetchColumn();

    $overview = [
        'total_sales' => round($total_sales, 2),
        'avg_order_value' => round($avg_order_value, 2),
        'total_orders' => (int)$total_orders,
        'total_users' => (int)$total_users,
        'sales_over_time' => $sales_over_time,
        'top_selling_products' => $top_selling_products,
        'most_ordered_products' => $most_ordered_products,
        'new_customers_last_30_days' => (int)$new_customers_last_30_days,
        'repeat_purchase_rate' => round($repeat_purchase_rate, 2),
        'low_stock_products' => $low_stock_products,
        'b2b_stats' => [
            'total_credit_limit' => round($credit_stats['total_limit'] ?? 0, 2),
            'total_credit_exposure' => round($credit_stats['total_exposure'] ?? 0, 2),
            'active_projects' => (int)$active_projects,
            'in_flight_shipments' => (int)$in_flight
        ]
    ];

    http_response_code(200);
    echo json_encode($overview);
}
?>
