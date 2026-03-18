<?php
require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../core/functions.php';

use Razorpay\Api\Api;

function create_payment_intent($id = null, $user_data = null) {
    // Guests are allowed to create payment intents


    $database = new Database();
    $db = $database->getConnection();

    // Fetch Razorpay Keys from DB
    $query_settings = "SELECT setting_key, setting_value FROM site_settings WHERE setting_key IN ('razorpay_key_id', 'razorpay_key_secret', 'tax_percentage')";
    $stmt_settings = $db->prepare($query_settings);
    $stmt_settings->execute();
    
    $settings = [];
    while ($row = $stmt_settings->fetch(PDO::FETCH_ASSOC)) {
        $settings[$row['setting_key']] = $row['setting_value'];
    }

    $keyId = $settings['razorpay_key_id'] ?? null;
    $keySecret = $settings['razorpay_key_secret'] ?? null;
    $taxPercent = floatval($settings['tax_percentage'] ?? 5);

    if (!$keyId || !$keySecret) {
        http_response_code(500);
        echo json_encode(["message" => "Razorpay configuration missing in system preferences."]);
        return;
    }

    $api = new Api($keyId, $keySecret);

    $data = json_decode(file_get_contents("php://input"));

    if (empty($data->items)) {
        http_response_code(400);
        echo json_encode(["message" => "No items provided."]);
        return;
    }

    // Recalculate total on server side
    $total_amount = 0;
    foreach ($data->items as $item) {
        $query = "SELECT price, dealer_price FROM products WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $item->id);
        $stmt->execute();
        $product = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($product) {
            $is_dealer = $user_data && $user_data->role === 'dealer';
            $price = ($is_dealer && $product['dealer_price']) ? $product['dealer_price'] : $product['price'];
            $total_amount += $price * $item->quantity;
        }
    }

    $gst_amount = $total_amount * ($taxPercent / 100); 
    $final_amount = $total_amount + $gst_amount;

    // Create Razorpay Order
    try {
        $orderData = [
            'receipt'         => 'rcpt_' . uniqid(),
            'amount'          => round($final_amount * 100), // Amount in paise
            'currency'        => 'INR', // Razorpay standard for India, can be dynamic
            'payment_capture' => 1 // Auto capture
        ];

        $razorpayOrder = $api->order->create($orderData);

        http_response_code(200);
        echo json_encode([
            'order_id' => $razorpayOrder['id'],
            'amount' => $orderData['amount'],
            'currency' => $orderData['currency'],
            'key_id' => $keyId, // Needed for frontend
            'user_name' => $user_data ? $user_data->name : ($data->customer_name ?? 'Guest'),
            'user_email' => $user_data ? $user_data->email : ($data->customer_email ?? ''),
            'user_phone' => $user_data ? ($user_data->phone ?? '') : ($data->customer_phone ?? '')
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['message' => 'Razorpay Order Creation Failed: ' . $e->getMessage()]);
    }
}
?>
