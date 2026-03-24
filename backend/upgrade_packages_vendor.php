<?php
require_once __DIR__ . '/src/Config/Database.php';
use App\Config\Database;

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    // Check if vendor_id exists
    $stmt = $conn->query("SHOW COLUMNS FROM packages LIKE 'vendor_id'");
    if ($stmt->rowCount() == 0) {
        // Add column
        $sql = "ALTER TABLE packages ADD COLUMN vendor_id INT NULL AFTER destination_id, 
                ADD CONSTRAINT fk_package_vendor FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE SET NULL";
        $conn->exec($sql);
        echo "Column vendor_id added successfully.\n";
    } else {
        echo "Column vendor_id already exists.\n";
    }
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
