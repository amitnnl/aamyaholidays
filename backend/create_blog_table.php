<?php
require_once __DIR__ . '/src/Config/Database.php';
use App\Config\Database;

$db = new Database();
$conn = $db->getConnection();

$sql = "CREATE TABLE IF NOT EXISTS blog_posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    excerpt TEXT,
    content LONGTEXT NOT NULL,
    image_url VARCHAR(255),
    author_name VARCHAR(100) DEFAULT 'Aamya Editorial',
    status ENUM('draft', 'published') DEFAULT 'draft',
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)";

try {
    $conn->exec($sql);
    
    // Auto-add image_url column if it doesn't exist on an older table
    $checkCol = "SHOW COLUMNS FROM blog_posts LIKE 'image_url'";
    $stmt = $conn->query($checkCol);
    if ($stmt->rowCount() == 0) {
        $conn->exec("ALTER TABLE blog_posts ADD COLUMN image_url VARCHAR(255) AFTER content");
        echo "Added image_url column.\n";
    }

    echo "Blog table verified/created successfully.\n";
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
