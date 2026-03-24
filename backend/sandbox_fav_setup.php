<?php
require_once __DIR__ . '/src/Config/Database.php';

use App\Config\Database;

try {
    $db = new Database();
    $conn = $db->getConnection();

    // Create Favorites (Wishlist) Table
    $createFavorites = "
    CREATE TABLE IF NOT EXISTS favorites (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        item_type ENUM('package', 'stay') NOT NULL,
        item_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_favorite (user_id, item_type, item_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ";
    
    $conn->exec($createFavorites);
    echo "Favorites table created successfully.\n";

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
