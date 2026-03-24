<?php
try {
    $db = new PDO('mysql:host=127.0.0.1;dbname=aamya_holiday', 'root', '');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Create Blog table
    $sql_blog = "CREATE TABLE IF NOT EXISTS blog_posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        excerpt TEXT,
        content LONGTEXT,
        author_id INT,
        published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status ENUM('published', 'draft') DEFAULT 'published',
        FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
    )";
    $db->exec($sql_blog);
    
    // Create Vendors table
    $sql_vendor = "CREATE TABLE IF NOT EXISTS vendors (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type ENUM('hotel', 'transport', 'guide', 'activity') NOT NULL,
        contact_email VARCHAR(255),
        contact_phone VARCHAR(50),
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    $db->exec($sql_vendor);

    // Insert dummy blog posts
    $db->exec("INSERT IGNORE INTO blog_posts (title, slug, excerpt, content) VALUES 
        ('Top 10 Things to do in Bali', 'top-10-things-bali', 'Discover the magic of Bali with our ultimate top 10 list.', 'Bali is an Indonesian island known for its forested volcanic mountains, iconic rice paddies, beaches and coral reefs...'),
        ('Why Paris is Always a Good Idea', 'why-paris', 'A complete guide to exploring the city of love.', 'Paris, Frances capital, is a major European city and a global center for art, fashion, gastronomy and culture...')
    ");

    // Insert dummy vendors
    $db->exec("INSERT IGNORE INTO vendors (name, type, contact_email, contact_phone) VALUES 
        ('Bali Resort Group', 'hotel', 'contact@baliresort.group', '+62 812 3456 7890'),
        ('Euro Transport Lines', 'transport', 'booking@eurotransport.com', '+33 1 23 45 67 89')
    ");

    echo 'Blog and Vendor tables created successfully.';
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
