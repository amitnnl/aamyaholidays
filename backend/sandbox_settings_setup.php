<?php
require_once __DIR__ . '/src/Config/Database.php';

use App\Config\Database;

try {
    $db = new Database();
    $conn = $db->getConnection();

    // Create Site Settings Table
    $createSettings = "
    CREATE TABLE IF NOT EXISTS site_settings (
        setting_key VARCHAR(100) PRIMARY KEY,
        setting_value TEXT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ";
    
    $conn->exec($createSettings);
    echo "Site Settings table created successfully.\n";

    // Seed defaults if empty
    $stmt = $conn->query("SELECT COUNT(*) FROM site_settings");
    if ($stmt->fetchColumn() == 0) {
        $insertSettings = "
        INSERT INTO site_settings (setting_key, setting_value) VALUES
        ('site_name', 'Aamya Holidays'),
        ('logo_text', '✈️ Aamya Holidays'),
        ('hero_heading', 'Discover the Extraordinary'),
        ('hero_subheading', 'Journeys tailored to your wildest dreams and expectations.'),
        ('hero_bg_image', 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920&q=80'),
        ('contact_email', 'concierge@aamya.holidays'),
        ('contact_phone', '+1 (800) 123-4567'),
        ('footer_text', 'Aamya Holidays provides curated luxury experiences for the modern traveler.')
        ";
        $conn->exec($insertSettings);
        echo "Default settings inserted.\n";
    } else {
        echo "Settings already exist.\n";
    }

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
