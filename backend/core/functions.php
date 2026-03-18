<?php
use JWT\JWT;
use JWT\Key;

function authenticate_user() {
    $secret_key = JWT_SECRET;
    $headers = getallheaders();
    $auth_header = $headers['Authorization'] ?? '';
    $jwt = null;

    if ($auth_header) {
        list($jwt) = sscanf($auth_header, 'Bearer %s');
    } elseif (isset($_GET['token'])) {
        $jwt = $_GET['token'];
    }

    if (!$jwt) {
        return null;
    }

    try {
        $decoded = JWT::decode($jwt, new Key($secret_key, 'HS256'));
        return $decoded->data;
    } catch (Exception $e) {
        error_log("JWT Decode Error: " . $e->getMessage()); 
        return null;
    }
}
    
    function create_thumbnail($source_path, $target_path, $max_width = 300, $max_height = 300) {
        if (!extension_loaded('gd')) {
            error_log("GD extension is not loaded. Skipping thumbnail generation.");
            return false;
        }
        list($width, $height, $type) = getimagesize($source_path);
        
        switch ($type) {
            case IMAGETYPE_JPEG: $src = imagecreatefromjpeg($source_path); break;
            case IMAGETYPE_PNG:  $src = imagecreatefrompng($source_path);  break;
            case IMAGETYPE_GIF:  $src = imagecreatefromgif($source_path);  break;
            case IMAGETYPE_WEBP: 
                if (function_exists('imagecreatefromwebp')) {
                    $src = imagecreatefromwebp($source_path); 
                } else {
                    return false;
                }
                break;
            default: return false;
        }
    
        $ratio = min($max_width / $width, $max_height / $height);
        $new_width = round($width * $ratio);
        $new_height = round($height * $ratio);
    
        $tmp = imagecreatetruecolor($new_width, $new_height);
        
        // Preserve transparency for PNG/GIF
        if ($type == IMAGETYPE_PNG || $type == IMAGETYPE_GIF || $type == IMAGETYPE_WEBP) {
            imagealphablending($tmp, false);
            imagesavealpha($tmp, true);
            $transparent = imagecolorallocatealpha($tmp, 255, 255, 255, 127);
            imagefilledrectangle($tmp, 0, 0, $new_width, $new_height, $transparent);
        }
    
        imagecopyresampled($tmp, $src, 0, 0, 0, 0, $new_width, $new_height, $width, $height);
        
        switch ($type) {
            case IMAGETYPE_JPEG: imagejpeg($tmp, $target_path, 85); break;
            case IMAGETYPE_PNG:  imagepng($tmp, $target_path, 8);   break;
            case IMAGETYPE_GIF:  imagegif($tmp, $target_path);      break;
            case IMAGETYPE_WEBP: 
                if (function_exists('imagewebp')) {
                    imagewebp($tmp, $target_path, 85); 
                } else {
                    imagejpeg($tmp, $target_path, 85); // Fallback to JPEG
                }
                break;
        }
    
        imagedestroy($src);
        imagedestroy($tmp);
        return true;
    }
    