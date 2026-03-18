<?php
function getenv_custom($key, $default = null) {
    $file = __DIR__ . '/../.env';
    if (is_readable($file)) {
        $content = file_get_contents($file);
        $lines = explode("\n", $content);
        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line) || $line[0] === '#') {
                continue;
            }
            if (strpos($line, '=') !== false) {
                list($name, $value) = explode('=', $line, 2);
                if (trim($name) === $key) {
                    return trim($value);
                }
            }
        }
    }
    return $default;
}

define('JWT_SECRET', getenv_custom('JWT_SECRET', 'default_secret_key'));

class Database {
    private $host;
    private $db_name;
    private $username;
    private $password;
    public $conn;

    public function __construct() {
        $this->host = getenv_custom('DB_HOST', '127.0.0.1');
        $this->db_name = getenv_custom('DB_NAME', 'torvo_tools');
        $this->username = getenv_custom('DB_USER', 'root');
        $this->password = getenv_custom('DB_PASS', '');
    }

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO("mysql:host=" . $this->host . ";dbname=" . $this->db_name, $this->username, $this->password);
            $this->conn->exec("set names utf8");
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION); 
        } catch(PDOException $exception) {
            error_log("Database Connection error: " . $exception->getMessage());
            return null; 
        }
        return $this->conn;
    }
}