<?php
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/error.log');
error_reporting(E_ALL);
ini_set('display_errors', 0);
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'config/database.php';
require_once 'libs/JWT.php';
require_once 'libs/Key.php';
require_once 'core/functions.php';

$request_uri = $_SERVER['REQUEST_URI'];
$base_path = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/\\');
$request_path = str_replace($base_path, '', $request_uri);
$parsed_url = parse_url($request_path);
$path = isset($parsed_url['path']) ? $parsed_url['path'] : '';
$path_parts = explode('/', trim($path, '/'));

$api_version = $path_parts[0] ?? '';
$resource = $path_parts[1] ?? '';
$id = $path_parts[2] ?? null;

if ($resource !== 'reports') {
    header("Content-Type: application/json; charset=UTF-8");
}

$user_data = authenticate_user();

$protected_routes = [
    'orders' => ['customer', 'dealer', 'admin'],
    'dealers' => ['admin'],
    'rfqs' => ['dealer', 'admin'],
    'quotes' => ['dealer', 'admin'],
    'coupons' => ['admin'],
    'users' => ['admin'],
    'analytics' => ['admin'],
    'wishlist' => ['customer', 'dealer', 'admin'],
    'profile' => ['customer', 'dealer', 'admin'],
    'payment' => ['customer', 'dealer', 'admin'],
    'reports' => ['customer', 'dealer', 'admin'],
    'fleet' => ['dealer', 'admin'],
    'invoices' => ['customer', 'dealer', 'admin'],
    'notifications' => ['customer', 'dealer', 'admin'],
    'procurement_dashboard' => ['dealer', 'admin'],
    'shipping' => ['customer', 'dealer', 'admin'],
    'projects' => ['customer', 'dealer', 'admin'],
    'inventory_prediction' => ['dealer', 'admin'],
    'credit' => ['customer', 'dealer', 'admin'],
];

if ($api_version == 'api' && $resource) {
    if ($resource === 'profile') {
        require 'api/users.php';
        $method = $_SERVER['REQUEST_METHOD'];
        if ($method === 'GET') get_me($id, $user_data);
        elseif ($method === 'PUT') update_me($id, $user_data);
        else {
            http_response_code(405);
            echo json_encode(["message" => "Method not allowed."]);
        }
        exit();
    }

    if ($resource === 'payment') {
        require 'api/payment.php';
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            create_payment_intent($id, $user_data);
        } else {
            http_response_code(405);
            echo json_encode(["message" => "Method not allowed."]);
        }
        exit();
    }

    if ($resource === 'track-order') {
        require 'api/orders.php';
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            track_order_public();
        } else {
            http_response_code(405);
            echo json_encode(["message" => "Method not allowed."]);
        }
        exit();
    }

    if ($resource === 'reports') {
        require 'api/reports.php';
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            get_reports($id, $user_data);
        } else {
            http_response_code(405);
            echo json_encode(["message" => "Method not allowed."]);
        }
        exit();
    }

    if (isset($protected_routes[$resource])) {
        // Special case: Allow POST /orders, POST /payment, and GET /coupons for guest checkout
        if ((($resource === 'orders' || $resource === 'payment') && $_SERVER['REQUEST_METHOD'] === 'POST') ||
            ($resource === 'coupons' && $_SERVER['REQUEST_METHOD'] === 'GET')) {
            // Allow guest
        } else {
            if (!$user_data && $resource !== 'settings') {
                http_response_code(401);
                echo json_encode(array("message" => "Access denied. Authentication required."));
                exit();
            }
            if ($user_data) {
                $allowed_roles = $protected_routes[$resource];
                if (!empty($allowed_roles) && !in_array($user_data->role, $allowed_roles)) {
                    http_response_code(403);
                    echo json_encode(array("message" => "Forbidden. You don't have the required role."));
                    exit();
                }
            }
        }
    }

    $api_file = "api/{$resource}.php";
    if (file_exists($api_file)) {
        require $api_file;

        $method = $_SERVER['REQUEST_METHOD'];

        if ($resource === 'users' || $resource === 'dealers' || $resource === 'banners' || $resource === 'categories' || $resource === 'brands' || $resource === 'products' || $resource === 'pages' || $resource === 'posts' || $resource === 'features' || $resource === 'menus') {
            switch ($method) {
                case 'GET':
                    if ($id) {
                        if ($resource === 'products') {
                            $function_name = 'get_products';
                        } else if ($resource === 'categories') {
                            $function_name = 'get_category';
                        } else {
                            $function_name = 'get_' . rtrim($resource, 's');
                        }
                        $function_name($id, $user_data);
                    } else {
                        if ($resource === 'products') {
                            $function_name = 'get_products';
                        } else {
                            $function_name = 'get_all_' . $resource;
                        }
                        $function_name(null, $user_data);
                    }
                    break;
                case 'POST':
                    error_log("POST Request received for resource: $resource, ID: $id");
                    error_log("POST data: " . print_r($_POST, true));
                    error_log("FILES data: " . print_r($_FILES, true));
                    if (isset($_POST['_method']) && $_POST['_method'] === 'PUT') {
                        if ($resource === 'products') {
                            $function_name = 'put_products';
                        } else if ($resource === 'categories') {
                            $function_name = 'update_category';
                        } else {
                            $function_name = 'update_' . rtrim($resource, 's');
                        }
                        $function_name($id, $user_data);
                    } elseif ($id === 'order' && ($resource === 'banners' || $resource === 'brands' || $resource === 'features' || $resource === 'menus')) {
                        $function_name = 'update_' . rtrim($resource, 's') . '_order';
                        $function_name(null, $user_data);
                    } else {
                        if ($resource === 'products') {
                            $function_name = 'post_products';
                        } else if ($resource === 'categories') {
                            $function_name = 'create_category';
                        } else {
                            $function_name = 'create_' . rtrim($resource, 's');
                        }
                        $function_name(null, $user_data);
                    }
                    break;
                case 'PUT':
                    if ($resource === 'products') {
                        $function_name = 'put_products';
                    } else if ($resource === 'categories') {
                        $function_name = 'update_category';
                    } else {
                        $function_name = 'update_' . rtrim($resource, 's');
                    }
                    $function_name($id, $user_data);
                    break;
                case 'DELETE':
                     if ($resource === 'products') {
                        $function_name = 'delete_products';
                    } else if ($resource === 'categories') {
                        $function_name = 'delete_category';
                    } else {
                        $function_name = 'delete_' . rtrim($resource, 's');
                    }
                    $function_name($id, $user_data);
                    break;
                default:
                    http_response_code(405);
                    echo json_encode(['message' => 'Method not allowed.']);
                    break;
            }
        } else {
            // Simplified logic for other resources
            $function_name = strtolower($method) . '_' . $resource;
            if ($resource === 'login' || $resource === 'register') {
                $function_name = 'post_' . $resource;
            }
            if (function_exists($function_name)) {
                $function_name($id, $user_data);
            } else {
                http_response_code(405);
                echo json_encode(array("message" => "Method not allowed."));
            }
        }
    } else {
        http_response_code(404);
        echo json_encode(array("message" => "Endpoint not found."));
    }
} else {
    http_response_code(404);
    echo json_encode(array("message" => "Not Found"));
}
?>
