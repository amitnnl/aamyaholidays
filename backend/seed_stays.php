<?php
require_once __DIR__ . '/src/Config/Database.php';
use App\Config\Database;

$db = new Database();
$conn = $db->getConnection();

$sql = "INSERT IGNORE INTO stays (name, slug, location, description, price_per_night, rating, amenities, image_url) VALUES 
('The Azure Resort & Spa', 'azure-resort-spa', 'Santorini, Greece', 'A world-class luxury resort featuring infinity pools that blend seamlessly into the Aegean Sea. Perfect for romantic getaways.', 850.00, 4.9, 'Infinity Pool, Spa, Ocean View, Fine Dining, Free WiFi', 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&fit=crop'),
('Alpine Lodge Aspen', 'alpine-lodge-aspen', 'Aspen, Colorado', 'Ski-in, ski-out access nestled directly on the slopes. Unwind by the massive stone fireplace after a day in the powder.', 650.00, 4.8, 'Ski Access, Fireplace, Hot Tub, Bar, Concierge', 'https://images.unsplash.com/photo-1542314831-c6a4d14d837e?w=800&fit=crop'),
('Emerald Villa', 'emerald-villa', 'Bali, Indonesia', 'Your private jungle sanctuary. Surrounded by lush greenery, this villa offers unparalleled privacy and a personal butler.', 420.00, 5.0, 'Private Pool, Butler, Jungle View, Free Breakfast, Yoga Pavilion', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&fit=crop');
";

try {
    $conn->exec($sql);
    echo "Stays seeded successfully.\n";
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
