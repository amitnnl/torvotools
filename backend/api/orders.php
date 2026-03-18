<?php
function get_orders($id = null, $user_data = null) {
    $database = new Database();
    $db = $database->getConnection();

    if ($user_data->role === 'admin') {
        $query = "SELECT o.*, u.name as user_name, u.email as user_email FROM orders o JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC";
        $stmt = $db->prepare($query);
    } else {
        $query = "SELECT o.*, u.name as user_name, u.email as user_email FROM orders o JOIN users u ON o.user_id = u.id WHERE o.user_id = :user_id ORDER BY o.created_at DESC";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":user_id", $user_data->id);
    }

    $stmt->execute();
    $num = $stmt->rowCount();

    if ($num > 0) {
        $orders_arr = array();
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $order_item = array(
                "id" => $row['id'],
                "user_id" => $row['user_id'],
                "user_name" => $row['user_name'],
                "user_email" => $row['user_email'],
                "total_amount" => $row['total_amount'],
                "gst_amount" => $row['gst_amount'],
                "status" => $row['status'],
                "shipping_address" => $row['shipping_address'],
                "created_at" => $row['created_at'],
                "items" => []
            );

            $query_items = "SELECT oi.quantity, oi.price, p.name as product_name FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = :order_id";
            $stmt_items = $db->prepare($query_items);
            $stmt_items->bindParam(":order_id", $row['id']);
            $stmt_items->execute();
            
            while ($item_row = $stmt_items->fetch(PDO::FETCH_ASSOC)) {
                array_push($order_item["items"], $item_row);
            }

            array_push($orders_arr, $order_item);
        }
        http_response_code(200);
        echo json_encode($orders_arr);
    } else {
        http_response_code(200);
        echo json_encode([]);
    }
}

function put_orders($id = null, $user_data = null) {
    if ($user_data->role !== 'admin') {
        http_response_code(403);
        echo json_encode(array("message" => "Forbidden. Only admins can update orders."));
        exit();
    }

    if (!$id) {
        http_response_code(400);
        echo json_encode(array("message" => "No order ID provided."));
        return;
    }

    $database = new Database();
    $db = $database->getConnection();
    $data = json_decode(file_get_contents("php://input"));

    if (!empty($data->status)) {
        $query = "UPDATE orders SET status = :status WHERE id = :id";
        $stmt = $db->prepare($query);

        $status = htmlspecialchars(strip_tags($data->status));
        $id = htmlspecialchars(strip_tags($id));

        $stmt->bindParam(":status", $status);
        $stmt->bindParam(":id", $id);

        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(array("message" => "Order status was updated."));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to update order status."));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Unable to update order status. Data is incomplete."));
    }
}

function post_orders($id = null, $user_data = null) {
    $database = new Database();
    $db = $database->getConnection();

    $data = json_decode(file_get_contents("php://input"));

    if (
        !empty($data->items) &&
        !empty($data->shipping_address) &&
        is_array($data->items)
    ) {
        $db->beginTransaction();

        try {
            // Calculate total and GST
            $total_amount = 0;
            foreach ($data->items as $item) {
                // You might want to re-fetch the price from the DB to prevent tampering
                $total_amount += $item->price * $item->quantity;
            }
            $gst_amount = $total_amount * 0.18; // Assuming 18% GST (9% CGST + 9% SGST)
            $total_amount_with_gst = $total_amount + $gst_amount;

            $payment_method = $data->payment_method ?? 'card';
            $payment_status = 'paid';
            if ($payment_method === 'credit_invoice') $payment_status = 'credit_approved';
            if ($payment_method === 'pod') $payment_status = 'on-delivery';

            if ($payment_method === 'credit_invoice') {
                $q_credit = "SELECT credit_limit, current_balance, credit_status FROM credit_accounts WHERE user_id = :user_id";
                $st_credit = $db->prepare($q_credit);
                $st_credit->bindParam(':user_id', $user_data->id);
                $st_credit->execute();
                $credit = $st_credit->fetch(PDO::FETCH_ASSOC);

                if (!$credit || $credit['credit_status'] !== 'active') {
                    throw new Exception("Credit account not active or non-existent.");
                }

                $available = (float)$credit['credit_limit'] - (float)$credit['current_balance'];
                if ($total_amount_with_gst > $available) {
                    throw new Exception("Insufficient credit limit. Available: " . $available);
                }

                // Deduct from credit (increase balance)
                $q_up_credit = "UPDATE credit_accounts SET current_balance = current_balance + :amount WHERE user_id = :user_id";
                $st_up_credit = $db->prepare($q_up_credit);
                $st_up_credit->bindParam(':amount', $total_amount_with_gst);
                $st_up_credit->bindParam(':user_id', $user_data->id);
                $st_up_credit->execute();

                // Auto-generate invoice record
                $invoice_number = 'INV-' . time() . '-' . strtoupper(substr(md5(uniqid()), 0, 4));
                $q_inv = "INSERT INTO invoices (user_id, order_id, invoice_number, subtotal, tax_amount, total_amount, status, due_date) 
                          VALUES (:user_id, :order_id, :inv_num, :sub, :tax, :tot, 'pending', :due)";
                $st_inv = $db->prepare($q_inv);
                $due_date = date('Y-m-d', strtotime('+30 days'));
                $st_inv->bindParam(':user_id', $user_data->id);
                $st_inv->bindParam(':order_id', $order_id);
                $st_inv->bindParam(':inv_num', $invoice_number);
                $st_inv->bindParam(':sub', $total_amount);
                $st_inv->bindParam(':tax', $gst_amount);
                $st_inv->bindParam(':tot', $total_amount_with_gst);
                $st_inv->bindParam(':due', $due_date);
                $st_inv->execute();
            }

            // Create order
            $query = "INSERT INTO orders (user_id, customer_name, customer_email, customer_phone, total_amount, gst_amount, shipping_address, payment_method, payment_status, project_id) 
                      VALUES (:user_id, :customer_name, :customer_email, :customer_phone, :total_amount, :gst_amount, :shipping_address, :payment_method, :payment_status, :project_id)";
            $stmt = $db->prepare($query);

            $project_id = $data->project_id ?? null;
            $user_id = $user_data ? $user_data->id : null;
            $customer_name = $data->customer_name ?? null;
            $customer_email = $data->customer_email ?? null;
            $customer_phone = $data->customer_phone ?? null;

            $stmt->bindParam(":user_id", $user_id);
            $stmt->bindParam(":customer_name", $customer_name);
            $stmt->bindParam(":customer_email", $customer_email);
            $stmt->bindParam(":customer_phone", $customer_phone);
            $stmt->bindParam(":total_amount", $total_amount_with_gst);
            $stmt->bindParam(":gst_amount", $gst_amount);
            $stmt->bindParam(":shipping_address", $data->shipping_address);
            $stmt->bindParam(":payment_method", $payment_method);
            $stmt->bindParam(":payment_status", $payment_status);
            $stmt->bindParam(":project_id", $project_id);

            $stmt->execute();
            $order_id = $db->lastInsertId();

            // Create order items and update inventory
            $query_item = "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (:order_id, :product_id, :quantity, :price)";
            $query_inventory = "UPDATE inventory SET quantity = quantity - :quantity WHERE product_id = :product_id";

            foreach ($data->items as $item) {
                // Insert order item
                $stmt_item = $db->prepare($query_item);
                $stmt_item->bindParam(":order_id", $order_id);
                $stmt_item->bindParam(":product_id", $item->id);
                $stmt_item->bindParam(":quantity", $item->quantity);
                $stmt_item->bindParam(":price", $item->price);
                $stmt_item->execute();

                // Update inventory
                $stmt_inventory = $db->prepare($query_inventory);
                $stmt_inventory->bindParam(":quantity", $item->quantity);
                $stmt_inventory->bindParam(":product_id", $item->id);
                $stmt_inventory->execute();
            }

            $db->commit();
            http_response_code(201);
            echo json_encode(array("message" => "Order was created.", "order_id" => $order_id));

        } catch (Exception $e) {
            $db->rollBack();
            http_response_code(503);
            echo json_encode(array("message" => "Unable to create order. " . $e->getMessage()));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Unable to create order. Data is incomplete."));
    }
}

function track_order_public() {
    $database = new Database();
    $db = $database->getConnection();
    
    $id = isset($_GET['order_id']) ? $_GET['order_id'] : null;
    $email = isset($_GET['email']) ? $_GET['email'] : null;

    if (!$id || !$email) {
        http_response_code(400);
        echo json_encode(["message" => "Order ID and Email are required."]);
        return;
    }

    // Search in orders table. Check user_email (logged in) or customer_email (guest)
    $query = "
        SELECT o.*, u.email as auth_email 
        FROM orders o 
        LEFT JOIN users u ON o.user_id = u.id 
        WHERE o.id = :id 
        AND (o.customer_email = :email OR u.email = :email_auth)
    ";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(":id", $id);
    $stmt->bindParam(":email", $email);
    $stmt->bindParam(":email_auth", $email);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        $order = [
            "id" => $row['id'],
            "status" => $row['status'],
            "total_amount" => $row['total_amount'],
            "created_at" => $row['created_at'],
            "shipping_address" => $row['shipping_address'],
            "items" => []
        ];

        // Get items
        $query_items = "SELECT oi.quantity, oi.price, p.name as product_name, p.image_url 
                        FROM order_items oi 
                        JOIN products p ON oi.product_id = p.id 
                        WHERE oi.order_id = :order_id";
        $stmt_items = $db->prepare($query_items);
        $stmt_items->bindParam(":order_id", $id);
        $stmt_items->execute();
        
        while ($item_row = $stmt_items->fetch(PDO::FETCH_ASSOC)) {
            $order["items"][] = $item_row;
        }

        http_response_code(200);
        echo json_encode($order);
    } else {
        http_response_code(404);
        echo json_encode(["message" => "Order not found or email mismatch."]);
    }
}
?>