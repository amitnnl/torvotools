<?php
require_once 'config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    // Create pages table
    $query = "CREATE TABLE IF NOT EXISTS `pages` (
        `id` int(11) NOT NULL AUTO_INCREMENT,
        `title` varchar(255) NOT NULL,
        `slug` varchar(255) NOT NULL UNIQUE,
        `content` longtext DEFAULT NULL,
        `meta_description` text DEFAULT NULL,
        `is_active` tinyint(1) DEFAULT 1,
        `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
        `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
        PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;";
    
    $db->exec($query);
    echo "Table 'pages' created successfully.
";

    // Create posts table
    $query = "CREATE TABLE IF NOT EXISTS `posts` (
        `id` int(11) NOT NULL AUTO_INCREMENT,
        `title` varchar(255) NOT NULL,
        `slug` varchar(255) NOT NULL UNIQUE,
        `content` longtext DEFAULT NULL,
        `excerpt` text DEFAULT NULL,
        `featured_image` varchar(255) DEFAULT NULL,
        `is_active` tinyint(1) DEFAULT 1,
        `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
        `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
        PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;";

    $db->exec($query);
    echo "Table 'posts' created successfully.
";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "
";
}
?>
