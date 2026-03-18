<?php
require_once 'backend/config/database.php';
$database = new Database();
$db = $database->getConnection();

$tables = [
    "pages" => "CREATE TABLE IF NOT EXISTS `pages` (
        `id` int(11) NOT NULL AUTO_INCREMENT,
        `title` varchar(255) NOT NULL,
        `slug` varchar(255) NOT NULL UNIQUE,
        `content` longtext DEFAULT NULL,
        `meta_description` text DEFAULT NULL,
        `is_active` tinyint(1) DEFAULT 1,
        `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
        `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
        PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;",
    
    "posts" => "CREATE TABLE IF NOT EXISTS `posts` (
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;",
    
    "features" => "CREATE TABLE IF NOT EXISTS `features` (
        `id` int(11) NOT NULL AUTO_INCREMENT,
        `title` varchar(255) NOT NULL,
        `description` text DEFAULT NULL,
        `icon` varchar(255) DEFAULT NULL,
        `sort_order` int(11) DEFAULT 0,
        PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;",

    "menus" => "CREATE TABLE IF NOT EXISTS `menus` (
        `id` int(11) NOT NULL AUTO_INCREMENT,
        `name` varchar(255) NOT NULL,
        `link` varchar(255) NOT NULL,
        `parent_id` int(11) DEFAULT NULL,
        `sort_order` int(11) DEFAULT 0,
        PRIMARY KEY (`id`),
        KEY `parent_id` (`parent_id`),
        CONSTRAINT `menus_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `menus` (`id`) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;"
];

foreach ($tables as $name => $sql) {
    try {
        $db->exec($sql);
        echo "Table '$name' checked/created.
";
    } catch (Exception $e) {
        echo "Error creating table '$name': " . $e->getMessage() . "
";
    }
}
?>
