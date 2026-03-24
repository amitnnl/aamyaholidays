<?php

$host = "127.0.0.1";
$username = "root";
$password = "";
$db_name = "aamya_holiday";

try {
    $conn = new PDO("mysql:host=$host", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Create Database
    $sql = "CREATE DATABASE IF NOT EXISTS `$db_name` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;";
    $conn->exec($sql);
    echo "Database created successfully or already exists.\n";

    // Use Database
    $conn->exec("USE `$db_name`");

    // Create Tables
    $sql = "
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        role ENUM('admin', 'customer', 'vendor') DEFAULT 'customer',
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS destinations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        meta_title VARCHAR(255),
        meta_description TEXT,
        image_url VARCHAR(255)
    );

    CREATE TABLE IF NOT EXISTS packages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        destination_id INT,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        days INT NOT NULL,
        nights INT NOT NULL,
        status ENUM('active', 'draft') DEFAULT 'draft',
        FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        package_id INT,
        total_amount DECIMAL(10,2),
        payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
        booking_status ENUM('confirmed', 'cancelled', 'completed') DEFAULT 'confirmed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (package_id) REFERENCES packages(id)
    );

    CREATE TABLE IF NOT EXISTS leads (
        id INT AUTO_INCREMENT PRIMARY KEY,
        package_id INT NULL,
        customer_name VARCHAR(255),
        customer_email VARCHAR(255),
        customer_phone VARCHAR(50),
        status ENUM('new', 'contacted', 'negotiation', 'won', 'lost') DEFAULT 'new',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    ";
    
    $conn->exec($sql);
    echo "Tables created successfully.\n";

    // Insert mock destinations if they don't exist
    $stmt = $conn->query("SELECT COUNT(*) FROM destinations");
    if ($stmt->fetchColumn() == 0) {
        $conn->exec("INSERT INTO destinations (name, slug, description) VALUES 
            ('Bali, Indonesia', 'bali-indonesia', 'Experience the beautiful beaches and culture...'),
            ('Paris, France', 'paris-france', 'The city of love and lights.'),
            ('Swiss Alps', 'swiss-alps', 'Breathtaking mountains and skiing adventures.')
        ");
        echo "Mock destinations inserted.\n";
    }

} catch(PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
