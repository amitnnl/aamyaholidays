<?php
require_once __DIR__ . '/src/Config/Database.php';
use App\Config\Database;

$db = new Database();
$conn = $db->getConnection();

$sql = "CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_ref VARCHAR(50) NOT NULL UNIQUE,
    user_id INT NOT NULL,
    package_id INT NOT NULL,
    check_in_date DATE NOT NULL,
    guests INT DEFAULT 1,
    primary_guest_name VARCHAR(100),
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Confirmed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE
)";

try {
    $conn->exec($sql);
    echo "Bookings table verified/created successfully.\n";
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
