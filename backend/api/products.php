<?php
// GET /api/products - Get all products
// GET /api/products/{id} - Get a single product
function get_products($id = null, $user_data = null) {
    header('Content-Type: application/json');
    $database = new Database();
    $db = $database->getConnection();
    if ($db === null) {
        http_response_code(500);
        echo json_encode(array("message" => "Database connection failed."));
        exit();
    }

    // Fetch Tier Discounts if dealer
    $tier_discounts = [1 => 0, 2 => 0, 3 => 0];
    if ($user_data && $user_data->role === 'dealer') {
        $q_settings = "SELECT setting_key, setting_value FROM site_settings WHERE setting_key LIKE 'dealer_tier_%_discount'";
        $st_settings = $db->prepare($q_settings);
        $st_settings->execute();
        while ($s_row = $st_settings->fetch(PDO::FETCH_ASSOC)) {
            if ($s_row['setting_key'] === 'dealer_tier_1_discount') $tier_discounts[1] = (float)$s_row['setting_value'];
            if ($s_row['setting_key'] === 'dealer_tier_2_discount') $tier_discounts[2] = (float)$s_row['setting_value'];
            if ($s_row['setting_key'] === 'dealer_tier_3_discount') $tier_discounts[3] = (float)$s_row['setting_value'];
        }
    }

    $price_column = "p.price, p.dealer_price";

    if ($id) {
        $query = "SELECT p.id, p.name, p.description, p.specifications, p.condition_status, p.bulk_pricing_json, {$price_column}, p.min_order_quantity, p.category_id, p.brand_id, c.name as category_name, b.name as brand_name, p.image_url, p.thumbnail_url, i.quantity as stock, i.low_stock_threshold 
                  FROM products p 
                  LEFT JOIN categories c ON p.category_id = c.id 
                  LEFT JOIN brands b ON p.brand_id = b.id
                  LEFT JOIN inventory i ON p.id = i.product_id
                  WHERE p.id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            $product = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Apply Tier Discount
            if ($user_data && $user_data->role === 'dealer') {
                $base_dealer_price = $product['dealer_price'] ?? $product['price'];
                $discount_percent = $tier_discounts[$user_data->tier] ?? 0;
                $product['price'] = $base_dealer_price * (1 - ($discount_percent / 100));
            }
            unset($product['dealer_price']);

            // --- New code to fetch related products ---
            $product_id = $product['id'];

            $related_query = "
                SELECT
                    pr.relation_type,
                    rp.id,
                    rp.name,
                    rp.image_url,
                    rp.price,
                    rp.dealer_price,
                    rp.min_order_quantity
                FROM
                    product_relations pr
                JOIN
                    products rp ON pr.related_product_id = rp.id
                WHERE
                    pr.main_product_id = :main_product_id
            ";
            $related_stmt = $db->prepare($related_query);
            $related_stmt->bindParam(":main_product_id", $product_id);
            $related_stmt->execute();

            $spare_parts = [];
            $accessories = [];

            while ($related_row = $related_stmt->fetch(PDO::FETCH_ASSOC)) {
                // Apply dealer price and tier discount if applicable
                $final_related_price = $related_row['price'];
                if ($user_data && $user_data->role === 'dealer') {
                    $base_dp = $related_row['dealer_price'] ?? $related_row['price'];
                    $dp = $tier_discounts[$user_data->tier] ?? 0;
                    $final_related_price = $base_dp * (1 - ($dp / 100));
                }
                $related_row['price'] = $final_related_price;
                unset($related_row['dealer_price']); // Remove original dealer_price

                if ($related_row['relation_type'] === 'spare_part') {
                    $spare_parts[] = $related_row;
                } elseif ($related_row['relation_type'] === 'accessory') {
                    $accessories[] = $related_row;
                }
            }

            $product['spare_parts'] = $spare_parts;
            $product['accessories'] = $accessories;

            // Fetch "You may also like" (same category, excluding current product and already listed parts)
            $exclude_ids = array_merge([$product_id], array_column($spare_parts, 'id'), array_column($accessories, 'id'));
            $placeholders = implode(',', array_fill(0, count($exclude_ids), '?'));
            
            $same_cat_query = "
                SELECT p.id, p.name, p.image_url, p.price, p.dealer_price, p.min_order_quantity 
                FROM products p 
                WHERE p.category_id = ? AND p.id NOT IN ($placeholders) 
                LIMIT 4
            ";
            $same_cat_stmt = $db->prepare($same_cat_query);
            $same_cat_stmt->bindValue(1, $product['category_id']);
            foreach ($exclude_ids as $k => $eid) {
                $same_cat_stmt->bindValue($k + 2, $eid);
            }
            $same_cat_stmt->execute();
            
            $related_products = [];
            while ($row = $same_cat_stmt->fetch(PDO::FETCH_ASSOC)) {
                // Apply dealer price and tier discount
                $final_price = $row['price'];
                if ($user_data && $user_data->role === 'dealer') {
                    $base_dp = $row['dealer_price'] ?? $row['price'];
                    $dp = $tier_discounts[$user_data->tier] ?? 0;
                    $final_price = $base_dp * (1 - ($dp / 100));
                }
                $row['price'] = $final_price;
                unset($row['dealer_price']);
                $related_products[] = $row;
            }
            $product['related_products'] = $related_products;
            // --- End new code ---

            http_response_code(200);
            echo json_encode($product);
        } else {
            http_response_code(404);
            echo json_encode(array("message" => "Product not found."));
        }
    } else {
        $search = $_GET['search'] ?? null;
        $category_id = $_GET['category_id'] ?? null;
        $brand_id = $_GET['brand_id'] ?? null;
        $sort = $_GET['sort'] ?? 'newest';
        $page = isset($_GET['page']) ? (int)$_GET['page'] : null;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
        $offset = $page ? ($page - 1) * $limit : 0;

        $count_query = "SELECT COUNT(*) FROM products p WHERE 1=1";
        $query = "SELECT p.id, p.name, p.description, p.specifications, p.condition_status, p.bulk_pricing_json, {$price_column}, p.min_order_quantity, p.category_id, p.brand_id, c.name as category_name, b.name as brand_name, p.image_url, p.thumbnail_url, p.created_at, i.quantity as stock, i.low_stock_threshold 
                  FROM products p 
                  LEFT JOIN categories c ON p.category_id = c.id 
                  LEFT JOIN brands b ON p.brand_id = b.id
                  LEFT JOIN inventory i ON p.id = i.product_id
                  WHERE 1=1";
        
        $params = [];

        if ($search) {
            $search_condition = " AND (p.name LIKE :search OR p.description LIKE :search)";
            $query .= $search_condition;
            $count_query .= $search_condition;
            $params[':search'] = '%' . $search . '%';
        }

        if ($category_id && $category_id !== 'All') {
            $cat_condition = " AND p.category_id = :category_id";
            $query .= $cat_condition;
            $count_query .= $cat_condition;
            $params[':category_id'] = $category_id;
        }

        if ($brand_id && $brand_id !== 'All') {
            $brand_condition = " AND p.brand_id = :brand_id";
            $query .= $brand_condition;
            $count_query .= $brand_condition;
            $params[':brand_id'] = $brand_id;
        }

        // Count total for pagination
        $count_stmt = $db->prepare($count_query);
        foreach ($params as $key => $val) {
            $count_stmt->bindValue($key, $val);
        }
        $count_stmt->execute();
        $total_records = $count_stmt->fetchColumn();

        switch ($sort) {
            case 'price-low':
                $query .= " ORDER BY p.price ASC";
                break;
            case 'price-high':
                $query .= " ORDER BY p.price DESC";
                break;
            case 'newest':
            default:
                $query .= " ORDER BY p.created_at DESC";
                break;
        }

        if ($page) {
            $query .= " LIMIT :limit OFFSET :offset";
        }

        $stmt = $db->prepare($query);
        foreach ($params as $key => $val) {
            $stmt->bindValue($key, $val);
        }
        if ($page) {
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        }
        $stmt->execute();

        $products_arr = array();
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            // Apply Tier Discount
            if ($user_data && $user_data->role === 'dealer') {
                $base_dealer_price = $row['dealer_price'] ?? $row['price'];
                $discount_percent = $tier_discounts[$user_data->tier] ?? 0;
                $row['price'] = $base_dealer_price * (1 - ($discount_percent / 100));
            }
            unset($row['dealer_price']);
            array_push($products_arr, $row);
        }

        http_response_code(200);
        if ($page) {
            echo json_encode([
                "data" => $products_arr,
                "meta" => [
                    "total" => (int)$total_records,
                    "page" => $page,
                    "limit" => $limit,
                    "total_pages" => ceil($total_records / $limit)
                ]
            ]);
        } else {
            echo json_encode($products_arr);
        }
    }
}

// POST /api/products - Create a new product
function post_products($id = null, $user_data = null) {
    if (!$user_data || $user_data->role !== 'admin') {
        http_response_code(403);
        echo json_encode(array("message" => "Forbidden."));
        exit();
    }

    $database = new Database();
    $db = $database->getConnection();
    if ($db === null) {
        http_response_code(500);
        echo json_encode(array("message" => "Database connection failed."));
        exit();
    }

    try {
        $db->beginTransaction(); // Start transaction

        $name = $_POST['name'] ?? '';
        $description = $_POST['description'] ?? '';
        $specifications = $_POST['specifications'] ?? null;
        $condition_status = $_POST['condition_status'] ?? 'Brand New';
        $price = $_POST['price'] ?? '';
        $dealer_price = $_POST['dealer_price'] ?? null;
        $min_order_quantity = $_POST['min_order_quantity'] ?? 1;
        $category_id = $_POST['category_id'] ?? '';
        $brand_id = $_POST['brand_id'] ?? null;
        
        $image_url = null;
        $thumbnail_url = null;
        if (isset($_FILES['image']) && $_FILES['image']['error'] == UPLOAD_ERR_OK) {
            $upload_dir_fs = __DIR__ . '/../uploads/';
            $thumb_dir_fs = $upload_dir_fs . 'thumbnails/';
            $upload_dir_url = 'uploads/';

            if (!is_dir($upload_dir_fs)) mkdir($upload_dir_fs, 0777, true);
            if (!is_dir($thumb_dir_fs)) mkdir($thumb_dir_fs, 0777, true);

            $image_name = uniqid() . '-' . basename($_FILES['image']['name']);
            $target_file_fs = $upload_dir_fs . $image_name;
            $thumb_file_fs = $thumb_dir_fs . $image_name;
            
            if (move_uploaded_file($_FILES['image']['tmp_name'], $target_file_fs)) {
                 $image_url = $upload_dir_url . $image_name;
                 // Generate Thumbnail
                 if (create_thumbnail($target_file_fs, $thumb_file_fs)) {
                     $thumbnail_url = $upload_dir_url . 'thumbnails/' . $image_name;
                 } else {
                     $thumbnail_url = $image_url; // Fallback to original
                 }
            } else {
                $db->rollBack();
                http_response_code(500);
                echo json_encode(array("message" => "Failed to upload image. Filesystem error."));
                exit();
            }
        }

        if ($name !== '' && $price !== '' && $category_id !== '') {
            $query = "INSERT INTO products (name, description, specifications, condition_status, price, dealer_price, min_order_quantity, category_id, brand_id, image_url, thumbnail_url) VALUES (:name, :description, :specifications, :condition_status, :price, :dealer_price, :min_order_quantity, :category_id, :brand_id, :image_url, :thumbnail_url)";
            $stmt = $db->prepare($query);

            $name = htmlspecialchars(strip_tags($name));
            $description = htmlspecialchars(strip_tags($description));
            $price = htmlspecialchars(strip_tags($price));
            $category_id = htmlspecialchars(strip_tags($category_id));

            // Handle empty strings for optional fields
            $dealer_price = ($dealer_price === '' || $dealer_price === 'null') ? null : $dealer_price;
            $brand_id = ($brand_id === '' || $brand_id === 'null') ? null : $brand_id;

            $stmt->bindParam(":name", $name);
            $stmt->bindParam(":description", $description);
            $stmt->bindParam(":specifications", $specifications);
            $stmt->bindParam(":condition_status", $condition_status);
            $stmt->bindParam(":price", $price);
            $stmt->bindParam(":dealer_price", $dealer_price);
            $stmt->bindParam(":min_order_quantity", $min_order_quantity);
            $stmt->bindParam(":category_id", $category_id);
            $stmt->bindParam(":brand_id", $brand_id);
            $stmt->bindParam(":image_url", $image_url);
            $stmt->bindParam(":thumbnail_url", $thumbnail_url);

            if ($stmt->execute()) {
                $product_id = $db->lastInsertId();

                // --- NEW: Initialize Inventory ---
                $initial_quantity = $_POST['initial_stock'] ?? 0;
                $low_stock_threshold = $_POST['low_stock_threshold'] ?? 10;
                $query_inventory = "INSERT INTO inventory (product_id, quantity, low_stock_threshold) VALUES (:product_id, :quantity, :low_stock_threshold)";
                $stmt_inventory = $db->prepare($query_inventory);
                $stmt_inventory->bindParam(":product_id", $product_id);
                $stmt_inventory->bindParam(":quantity", $initial_quantity);
                $stmt_inventory->bindParam(":low_stock_threshold", $low_stock_threshold);
                $stmt_inventory->execute();
                // --- END NEW ---

                $spare_part_ids = $_POST['spare_part_ids'] ?? [];
                if (is_array($spare_part_ids) && !empty($spare_part_ids)) {
                    $insert_spare_part_query = "INSERT INTO product_relations (main_product_id, related_product_id, relation_type) VALUES (:main_product_id, :related_product_id, 'spare_part')";
                    $insert_spare_part_stmt = $db->prepare($insert_spare_part_query);
                    foreach ($spare_part_ids as $related_product_id) {
                        $insert_spare_part_stmt->bindParam(":main_product_id", $product_id);
                        $insert_spare_part_stmt->bindParam(":related_product_id", $related_product_id);
                        $insert_spare_part_stmt->execute();
                    }
                }

                $accessory_ids = $_POST['accessory_ids'] ?? [];
                if (is_array($accessory_ids) && !empty($accessory_ids)) {
                    $insert_accessory_query = "INSERT INTO product_relations (main_product_id, related_product_id, relation_type) VALUES (:main_product_id, :related_product_id, 'accessory')";
                    $insert_accessory_stmt = $db->prepare($insert_accessory_query);
                    foreach ($accessory_ids as $related_product_id) {
                        $insert_accessory_stmt->bindParam(":main_product_id", $product_id);
                        $insert_accessory_stmt->bindParam(":related_product_id", $related_product_id);
                        $insert_accessory_stmt->execute();
                    }
                }

                $db->commit();
                http_response_code(201);
                echo json_encode(array("message" => "Product was created."));
            } else {
                $errorInfo = $stmt->errorInfo();
                error_log("DB Error in post_products: " . print_r($errorInfo, true));
                $db->rollBack();
                http_response_code(500);
                echo json_encode(array("message" => "Unable to create product. DB Error: " . ($errorInfo[2] ?? 'Unknown error')));
            }
        } else {
            $db->rollBack();
            http_response_code(400);
            echo json_encode(array("message" => "Unable to create product. Data is incomplete."));
        }
    } catch (Exception $e) {
        $db->rollBack();
        http_response_code(503);
        echo json_encode(array("message" => "Unable to create product: " . $e->getMessage()));
    }
}


// PUT /api/products/{id} - Update a product
function put_products($id = null, $user_data = null) {
    if (!$user_data || $user_data->role !== 'admin' || !$id) {
        http_response_code(403);
        echo json_encode(array("message" => "Forbidden or missing ID."));
        exit();
    }

    $database = new Database();
    $db = $database->getConnection();
    if ($db === null) {
        http_response_code(500);
        echo json_encode(array("message" => "Database connection failed."));
        exit();
    }

    $db->beginTransaction(); // Start transaction

    try {
        if (empty($_POST) && empty($_FILES)) {
            error_log("Empty POST and FILES data in put_products. Raw Input: " . file_get_contents('php://input'));
            http_response_code(400);
            echo json_encode(array("message" => "Critical Error: No data received. Check post_max_size or request format."));
            exit();
        }
        // Use $_POST for form data
        $name = $_POST['name'] ?? '';
        $description = $_POST['description'] ?? '';
        $specifications = $_POST['specifications'] ?? null;
        $condition_status = $_POST['condition_status'] ?? 'Brand New';
        $price = $_POST['price'] ?? '';
        $dealer_price = $_POST['dealer_price'] ?? null;
        $min_order_quantity = $_POST['min_order_quantity'] ?? 1;
        $category_id = $_POST['category_id'] ?? '';
        $brand_id = $_POST['brand_id'] ?? null;

        if ($name === '' || $price === '' || $category_id === '') {
            error_log("Missing fields in put_products. Name: '$name', Price: '$price', Category: '$category_id'");
        }
        
        $upload_dir_fs = __DIR__ . '/../uploads/';
        $thumb_dir_fs = $upload_dir_fs . 'thumbnails/';
        $upload_dir_url = 'uploads/';
        
        // Fetch existing image_url first
        $stmt_img = $db->prepare("SELECT image_url, thumbnail_url FROM products WHERE id = :id");
        $stmt_img->bindParam(":id", $id);
        $stmt_img->execute();
        $existing_product = $stmt_img->fetch(PDO::FETCH_ASSOC);
        $image_url = $existing_product['image_url'] ?? null; 
        $thumbnail_url = $existing_product['thumbnail_url'] ?? null;

        if (isset($_FILES['image']) && $_FILES['image']['error'] == UPLOAD_ERR_OK) {
            if (!is_dir($upload_dir_fs)) mkdir($upload_dir_fs, 0777, true);
            if (!is_dir($thumb_dir_fs)) mkdir($thumb_dir_fs, 0777, true);

            $image_name = uniqid() . '-' . basename($_FILES['image']['name']);
            $target_file_fs = $upload_dir_fs . $image_name;
            $thumb_file_fs = $thumb_dir_fs . $image_name;
            $new_image_url = $upload_dir_url . $image_name;

            if (move_uploaded_file($_FILES['image']['tmp_name'], $target_file_fs)) {
                // Delete old image and thumbnail if they exist
                if ($image_url) {
                    $old_image_path = realpath($upload_dir_fs . basename($image_url));
                    if ($old_image_path && file_exists($old_image_path) && !is_dir($old_image_path)) {
                        unlink($old_image_path);
                    }
                }
                if ($thumbnail_url) {
                    $old_thumb_path = realpath($thumb_dir_fs . basename($thumbnail_url));
                    if ($old_thumb_path && file_exists($old_thumb_path) && !is_dir($old_thumb_path)) {
                        unlink($old_thumb_path);
                    }
                }

                $image_url = $new_image_url;
                if (create_thumbnail($target_file_fs, $thumb_file_fs)) {
                    $thumbnail_url = $upload_dir_url . 'thumbnails/' . $image_name;
                } else {
                    $thumbnail_url = $image_url;
                }
            } else {
                $db->rollBack();
                http_response_code(500);
                echo json_encode(array("message" => "Failed to upload new image."));
                exit();
            }
        } elseif (isset($_POST['image_url_removed']) && $_POST['image_url_removed'] === 'true') {
            if ($image_url) {
                $old_image_path = realpath($upload_dir_fs . basename($image_url));
                if ($old_image_path && file_exists($old_image_path)) {
                    unlink($old_image_path);
                }
            }
            if ($thumbnail_url) {
                $old_thumb_path = realpath($thumb_dir_fs . basename($thumbnail_url));
                if ($old_thumb_path && file_exists($old_thumb_path)) {
                    unlink($old_thumb_path);
                }
            }
            $image_url = null;
            $thumbnail_url = null;
        }

        if ($name !== '' && $price !== '' && $category_id !== '') {
            $query = "UPDATE products SET name = :name, description = :description, specifications = :specifications, condition_status = :condition_status, price = :price, dealer_price = :dealer_price, min_order_quantity = :min_order_quantity, category_id = :category_id, brand_id = :brand_id, image_url = :image_url, thumbnail_url = :thumbnail_url WHERE id = :id";
            $stmt = $db->prepare($query);

            $name = htmlspecialchars(strip_tags($name));
            $description = htmlspecialchars(strip_tags($description));
            $price = htmlspecialchars(strip_tags($price));
            $category_id = htmlspecialchars(strip_tags($category_id));
            $id_sanitized = htmlspecialchars(strip_tags($id));

            // Handle empty strings for optional fields
            $dealer_price = ($dealer_price === '' || $dealer_price === 'null') ? null : $dealer_price;
            $brand_id = ($brand_id === '' || $brand_id === 'null') ? null : $brand_id;

            $stmt->bindParam(":name", $name);
            $stmt->bindParam(":description", $description);
            $stmt->bindParam(":specifications", $specifications);
            $stmt->bindParam(":condition_status", $condition_status);
            $stmt->bindParam(":price", $price);
            $stmt->bindParam(":dealer_price", $dealer_price);
            $stmt->bindParam(":min_order_quantity", $min_order_quantity);
            $stmt->bindParam(":category_id", $category_id);
            $stmt->bindParam(":brand_id", $brand_id);
            $stmt->bindParam(":image_url", $image_url);
            $stmt->bindParam(":thumbnail_url", $thumbnail_url);
            $stmt->bindParam(":id", $id_sanitized);

            if ($stmt->execute()) {
                $product_id = $id_sanitized;

                // --- Update Threshold ---
                $low_stock_threshold = $_POST['low_stock_threshold'] ?? 10;
                $update_inventory_query = "UPDATE inventory SET low_stock_threshold = :threshold WHERE product_id = :product_id";
                $update_inventory_stmt = $db->prepare($update_inventory_query);
                $update_inventory_stmt->bindParam(":threshold", $low_stock_threshold);
                $update_inventory_stmt->bindParam(":product_id", $product_id);
                $update_inventory_stmt->execute();
    
                // Delete existing relations for this product
                $delete_relations_query = "DELETE FROM product_relations WHERE main_product_id = :main_product_id";
                $delete_relations_stmt = $db->prepare($delete_relations_query);
                $delete_relations_stmt->bindParam(":main_product_id", $product_id);
                $delete_relations_stmt->execute();
    
                // Insert new spare parts
                $spare_part_ids = $_POST['spare_part_ids'] ?? [];
                if (is_array($spare_part_ids) && !empty($spare_part_ids)) {
                    $insert_spare_part_query = "INSERT INTO product_relations (main_product_id, related_product_id, relation_type) VALUES (:main_product_id, :related_product_id, 'spare_part')";
                    $insert_spare_part_stmt = $db->prepare($insert_spare_part_query);
                    foreach ($spare_part_ids as $related_product_id) {
                        $insert_spare_part_stmt->bindParam(":main_product_id", $product_id);
                        $insert_spare_part_stmt->bindParam(":related_product_id", $related_product_id);
                        $insert_spare_part_stmt->execute();
                    }
                }
    
                // Insert new accessories
                $accessory_ids = $_POST['accessory_ids'] ?? [];
                if (is_array($accessory_ids) && !empty($accessory_ids)) {
                    $insert_accessory_query = "INSERT INTO product_relations (main_product_id, related_product_id, relation_type) VALUES (:main_product_id, :related_product_id, 'accessory')";
                    $insert_accessory_stmt = $db->prepare($insert_accessory_query);
                    foreach ($accessory_ids as $related_product_id) {
                        $insert_accessory_stmt->bindParam(":main_product_id", $product_id);
                        $insert_accessory_stmt->bindParam(":related_product_id", $related_product_id);
                        $insert_accessory_stmt->execute();
                    }
                }
    
                $db->commit();
                http_response_code(200);
                echo json_encode(array("message" => "Product was updated."));                        
            } else {
                $errorInfo = $stmt->errorInfo();
                error_log("DB Error in put_products: " . print_r($errorInfo, true));
                $db->rollBack();
                http_response_code(500);
                echo json_encode(array("message" => "Unable to update product. DB Error: " . ($errorInfo[2] ?? 'Unknown error')));
            }
        } else {
            $db->rollBack();
            $missing = [];
            if (empty($name)) $missing[] = 'name';
            if (empty($price)) $missing[] = 'price';
            if (empty($category_id)) $missing[] = 'category_id';
            
            http_response_code(400);
            echo json_encode(array(
                "message" => "Unable to update product. Data is incomplete.",
                "missing_fields" => $missing,
                "debug_received" => [
                    "name" => $name,
                    "price" => $price,
                    "category_id" => $category_id
                ]
            ));
        }
    } catch (Exception $e) {
        $db->rollBack(); // Rollback on any exception
        http_response_code(503);
        echo json_encode(array("message" => "Unable to update product: " . $e->getMessage()));
    }
}

// DELETE /api/products/{id} - Delete a product
function delete_products($id = null, $user_data = null) {
    if (!$user_data || $user_data->role !== 'admin' || !$id) {
        http_response_code(403);
        echo json_encode(array("message" => "Forbidden or missing ID."));
        exit();
    }

    $database = new Database();
    $db = $database->getConnection();
    if ($db === null) {
        http_response_code(500);
        echo json_encode(array("message" => "Database connection failed."));
        exit();
    }

    // Fetch image paths before deleting the record
    $stmt_img = $db->prepare("SELECT image_url, thumbnail_url FROM products WHERE id = :id");
    $stmt_img->bindParam(":id", $id);
    $stmt_img->execute();
    $product = $stmt_img->fetch(PDO::FETCH_ASSOC);

    $query = "DELETE FROM products WHERE id = :id";
    $stmt = $db->prepare($query);

    $id = htmlspecialchars(strip_tags($id));
    $stmt->bindParam(":id", $id);

    if ($stmt->execute()) {
        // Delete files if they exist
        if ($product) {
            $upload_dir_fs = __DIR__ . '/../uploads/';
            if (!empty($product['image_url'])) {
                $image_path = realpath($upload_dir_fs . basename($product['image_url']));
                if ($image_path && file_exists($image_path) && !is_dir($image_path)) {
                    unlink($image_path);
                }
            }
            if (!empty($product['thumbnail_url'])) {
                $thumb_path = realpath($upload_dir_fs . 'thumbnails/' . basename($product['thumbnail_url']));
                if ($thumb_path && file_exists($thumb_path) && !is_dir($thumb_path)) {
                    unlink($thumb_path);
                }
            }
        }
        http_response_code(200);
        echo json_encode(array("message" => "Product was deleted."));
    } else {
        http_response_code(503);
        echo json_encode(array("message" => "Unable to delete product."));
    }
}
?>