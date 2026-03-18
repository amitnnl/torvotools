<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../core/functions.php';

function get_reports($id = null, $user_data = null) {
    // If user_data is not passed via authenticate_user (which happens in index.php),
    // we check for token in GET for download links
    if (!$user_data && isset($_GET['token'])) {
        // This is a bit of a hack since index.php already tries to authenticate.
        // If it failed, it would have already exited. 
        // We'll trust the user_data passed by index.php or handle if it's missing.
    }

    if (!$user_data) {
        http_response_code(401);
        echo json_encode(["message" => "Unauthorized for technical data export."]);
        return;
    }

    $type = $_GET['type'] ?? 'sales'; 
    $database = new Database();
    $db = $database->getConnection();

    if ($type === 'sales' && $user_data->role === 'admin') {
        generate_sales_report($db);
    } elseif ($type === 'inventory' && $user_data->role === 'admin') {
        generate_inventory_report($db);
    } elseif ($type === 'gst' && ($user_data->role === 'admin' || $user_data->role === 'dealer')) {
        generate_gst_report($db, $user_data);
    } elseif ($type === 'statement') {
        generate_account_statement($db, $user_data);
    } else {
        http_response_code(403);
        echo json_encode(["message" => "Access Denied to requested report module."]);
    }
}

function generate_sales_report($db) {
    $query = "SELECT o.id, u.name as customer, o.total_amount, o.status, o.created_at 
              FROM orders o 
              JOIN users u ON o.user_id = u.id 
              ORDER BY o.created_at DESC";
    $stmt = $db->prepare($query);
    $stmt->execute();

    header('Content-Type: text/csv');
    header('Content-Disposition: attachment; filename="TORVO_SALES_REPORT_'.date('Y-m-d').'.csv"');

    $output = fopen('php://output', 'w');
    fputcsv($output, ['ORDER ID', 'CUSTOMER', 'TOTAL AMOUNT', 'STATUS', 'TIMESTAMP']);

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        fputcsv($output, $row);
    }
    fclose($output);
    exit();
}

function generate_inventory_report($db) {
    $query = "SELECT p.id, p.name, c.name as category, IFNULL(i.quantity, 0) as stock, IFNULL(i.low_stock_threshold, 0) as limit_val
              FROM products p 
              JOIN categories c ON p.category_id = c.id
              LEFT JOIN inventory i ON p.id = i.product_id
              ORDER BY stock ASC";
    $stmt = $db->prepare($query);
    $stmt->execute();

    header('Content-Type: text/csv');
    header('Content-Disposition: attachment; filename="TORVO_INVENTORY_AUDIT_'.date('Y-m-d').'.csv"');

    $output = fopen('php://output', 'w');
    fputcsv($output, ['ASSET ID', 'DESIGNATION', 'SECTOR', 'CURRENT STOCK', 'TECHNICAL LIMIT']);

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        fputcsv($output, $row);
    }
    fclose($output);
    exit();
}

function generate_account_statement($db, $user_data) {
    $query = "SELECT id as order_id, total_amount, status, created_at as date 
              FROM orders 
              WHERE user_id = :user_id 
              ORDER BY created_at DESC";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $user_data->id);
    $stmt->execute();

    header('Content-Type: text/csv');
    header('Content-Disposition: attachment; filename="TORVO_STATEMENT_'.date('Y-m-d').'.csv"');

    $output = fopen('php://output', 'w');
    fputcsv($output, ['--- ACCOUNT PROCUREMENT STATEMENT ---']);
    fputcsv($output, ['PARTNER:', strtoupper($user_data->name)]);
    fputcsv($output, ['EMAIL:', strtoupper($user_data->email)]);
    fputcsv($output, ['GENERATED:', date('Y-m-d H:i:s')]);
    fputcsv($output, []);
    fputcsv($output, ['TRANSACTION ID', 'TOTAL VALUATION', 'NODE STATUS', 'TIMESTAMP']);

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        fputcsv($output, $row);
    }
    fclose($output);
    exit();
}

function generate_gst_report($db, $user_data) {
    $is_admin = $user_data->role === 'admin';
    
    $query = "SELECT i.invoice_number, i.total_amount, i.tax_amount, i.status, i.created_at, u.name as partner
              FROM invoices i
              JOIN users u ON i.user_id = u.id";
    
    if (!$is_admin) {
        $query .= " WHERE i.user_id = :user_id";
    }
    
    $query .= " ORDER BY i.created_at DESC";
    
    $stmt = $db->prepare($query);
    if (!$is_admin) {
        $stmt->bindParam(':user_id', $user_data->id);
    }
    $stmt->execute();

    header('Content-Type: text/csv');
    header('Content-Disposition: attachment; filename="TORVO_GST_MANIFEST_'.date('Y-m-d').'.csv"');

    $output = fopen('php://output', 'w');
    fputcsv($output, ['--- OFFICIAL GST PROCUREMENT MANIFEST ---']);
    fputcsv($output, ['ENTITY:', strtoupper($user_data->name)]);
    fputcsv($output, ['PERIOD:', date('F Y')]);
    fputcsv($output, []);
    fputcsv($output, ['INVOICE TOKEN', 'NET VALUATION', 'GST/TAX COMPONENT', 'STATUS', 'TIMESTAMP', 'RECIPIENT']);

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        fputcsv($output, $row);
    }
    fclose($output);
    exit();
}
?>
