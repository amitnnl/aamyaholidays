<?php
require_once __DIR__ . '/src/Config/Database.php';

use App\Config\Database;

try {
    $db = new Database();
    $conn = $db->getConnection();

    // 1. Create Bookings Table
    $createBookings = "
    CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        package_id INT NOT NULL,
        check_in_date DATE NOT NULL,
        guests INT NOT NULL,
        primary_guest_name VARCHAR(255),
        total_amount DECIMAL(10,2) NOT NULL,
        status ENUM('Pending', 'Confirmed', 'Cancelled') DEFAULT 'Confirmed',
        booking_ref VARCHAR(50) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ";
    $conn->exec($createBookings);
    echo "Bookings table created or exists.\n";

    // 2. Create Stays Table
    $createStays = "
    CREATE TABLE IF NOT EXISTS stays (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        location VARCHAR(255) NOT NULL,
        price_per_night DECIMAL(10,2) NOT NULL,
        rating DECIMAL(3,1) DEFAULT 5.0,
        image_url VARCHAR(500),
        amenities TEXT,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ";
    $conn->exec($createStays);
    echo "Stays table created or exists.\n";

    // Insert Dummy Stays Data if empty
    $stmt = $conn->query("SELECT COUNT(*) FROM stays");
    if ($stmt->fetchColumn() == 0) {
        $insertStays = "
        INSERT INTO stays (name, slug, location, price_per_night, rating, image_url, amenities, description) VALUES
        ('The Ritz-Carlton Bali', 'ritz-carlton-bali', 'Bali, Indonesia', 450.00, 4.9, 'https://images.unsplash.com/photo-1542314831-c6a4d14d837e?w=800&fit=crop', 'Pool,Spa,Beachfront,WiFi', 'Experience unparalleled luxury on the white sand beaches of Bali.'),
        ('Four Seasons Kyoto', 'four-seasons-kyoto', 'Kyoto, Japan', 850.00, 5.0, 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&fit=crop', 'Zen Garden,Tea House,Spa,WiFi', 'A serene sanctuary featuring an 800-year-old pond garden.'),
        ('Aman Venice', 'aman-venice', 'Venice, Italy', 1200.00, 4.9, 'https://images.unsplash.com/photo-1516496636080-14fb876e029d?w=800&fit=crop', 'Canal View,Private Boat,Fine Dining,WiFi', 'A spectacular 16th-century palazzo nestled on the Grand Canal.'),
        ('Al Maha Desert Resort', 'al-maha-desert-resort', 'Dubai, UAE', 900.00, 4.8, 'https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?w=800&fit=crop', 'Private Pool,Desert Safari,Spa,WiFi', 'Exclusive luxury eco-resort nestled within the Dubai Desert Conservation Reserve.')
        ";
        $conn->exec($insertStays);
        echo "Inserted initial stays data.\n";
    }

} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}
