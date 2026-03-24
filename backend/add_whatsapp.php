<?php
require_once __DIR__ . '/src/Config/Database.php';

try {
    $db = new \App\Config\Database();
    $conn = $db->getConnection();
    
    // Check if whatsapp_number exists
    $stmt = $conn->query("SHOW COLUMNS FROM site_settings LIKE 'whatsapp_number'");
    if ($stmt->rowCount() == 0) {
        $conn->exec("ALTER TABLE site_settings ADD COLUMN whatsapp_number VARCHAR(100) NULL AFTER contact_phone");
        echo "whatsapp_number column added.\n";
    } else {
        echo "Column already exists.\n";
    }
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
