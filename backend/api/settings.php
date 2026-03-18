<?php
// Function to get all site settings
// Function to get all site settings
function get_settings($id = null, $user_data = null) {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        http_response_code(500);
        echo json_encode(["message" => "Critical System Error: Database Connection Failed."]);
        return;
    }

    $query = "SELECT setting_key, setting_value FROM site_settings";
    $stmt = $db->prepare($query);
    $stmt->execute();

    $settings = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $settings[$row['setting_key']] = $row['setting_value'];
    }

    http_response_code(200);
    echo json_encode($settings);
}

// Function to update site settings
function post_settings($id = null, $user_data = null) {
    error_log("Settings Update Request Received. User Data: " . print_r($user_data, true));
    
    if (!$user_data || $user_data->role !== 'admin') {
        error_log("Settings Update Rejected: Unauthorized access attempted.");
        http_response_code(403);
        echo json_encode(["message" => "Forbidden. AUTHENTICATION_REQUIRED_AS_ADMIN."]);
        return;
    }
    
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        error_log("Settings Update Failed: Database Connection Error.");
        http_response_code(500);
        echo json_encode(["message" => "Database Connection Failure."]);
        return;
    }

    $data = $_POST;
    error_log("Settings Data in _POST: " . print_r($data, true));
    error_log("Files in _FILES: " . print_r($_FILES, true));

    $uploadDir = __DIR__ . '/../uploads/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    // Fetch existing settings to get old file paths for deletion
    $existingSettingsQuery = "SELECT setting_key, setting_value FROM site_settings WHERE setting_key IN ('logo_url', 'favicon_url')";
    $existingSettingsStmt = $db->prepare($existingSettingsQuery);
    $existingSettingsStmt->execute();
    $existingSettings = [];
    while ($row = $existingSettingsStmt->fetch(PDO::FETCH_ASSOC)) {
        $existingSettings[$row['setting_key']] = $row['setting_value'];
    }

    // Handle Logo File
    if (isset($_FILES['logo_file']) && $_FILES['logo_file']['error'] == UPLOAD_ERR_OK) {
        $fileExtension = pathinfo($_FILES['logo_file']['name'], PATHINFO_EXTENSION);
        $uniqueName = 'logo_' . uniqid() . '.' . $fileExtension;
        if (move_uploaded_file($_FILES['logo_file']['tmp_name'], $uploadDir . $uniqueName)) {
            // Delete old logo if it exists
            if (isset($existingSettings['logo_url'])) {
                $oldLogoPath = realpath($uploadDir . basename($existingSettings['logo_url']));
                if ($oldLogoPath && file_exists($oldLogoPath) && !is_dir($oldLogoPath)) {
                    unlink($oldLogoPath);
                }
            }
            $data['logo_url'] = 'uploads/' . $uniqueName;
        }
    }

    // Handle Favicon File
    if (isset($_FILES['favicon_file']) && $_FILES['favicon_file']['error'] == UPLOAD_ERR_OK) {
        $fileExtension = pathinfo($_FILES['favicon_file']['name'], PATHINFO_EXTENSION);
        $uniqueName = 'favicon_' . uniqid() . '.' . $fileExtension;
        if (move_uploaded_file($_FILES['favicon_file']['tmp_name'], $uploadDir . $uniqueName)) {
            // Delete old favicon if it exists
            if (isset($existingSettings['favicon_url'])) {
                $oldFaviconPath = realpath($uploadDir . basename($existingSettings['favicon_url']));
                if ($oldFaviconPath && file_exists($oldFaviconPath) && !is_dir($oldFaviconPath)) {
                    unlink($oldFaviconPath);
                }
            }
            $data['favicon_url'] = 'uploads/' . $uniqueName;
        }
    }

    if (empty($data)) {
        error_log("Settings Update Warning: No settings data found in request.");
        http_response_code(400);
        echo json_encode(["message" => "TRANSMISSION_PAYLOAD_EMPTY."]);
        return;
    }

    $db->beginTransaction();

    try {
        $query = "INSERT INTO site_settings (setting_key, setting_value) VALUES (:key, :value)
                  ON DUPLICATE KEY UPDATE setting_value = :value";
        $stmt = $db->prepare($query);

        foreach ($data as $key => $value) {
            // Sanitization and cleaning
            $clean_key = strip_tags(trim($key));
            
            // Handle null/undefined strings if sent by frontend
            if ($value === 'null' || $value === 'undefined') {
                $value = null;
            }

            $stmt->bindParam(':key', $clean_key, PDO::PARAM_STR);
            $stmt->bindParam(':value', $value, PDO::PARAM_STR);
            $stmt->execute();
        }

        $db->commit();
        error_log("Settings Updated Successfully.");
        http_response_code(200);
        echo json_encode(["message" => "GLOBAL CONFIGURATION UPDATED.", "settings" => $data]);

    } catch (Exception $e) {
        $db->rollBack();
        error_log("Settings Update Exception: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(["message" => "DB_INTERNAL_ERROR: " . $e->getMessage()]);
    }
}

?>
