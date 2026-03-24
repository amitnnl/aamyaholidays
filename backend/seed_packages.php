<?php
try {
    $db = new PDO('mysql:host=127.0.0.1;dbname=aamya_holiday', 'root', '');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $sql = "INSERT IGNORE INTO packages (title, slug, destination_id, price, days, nights, status) VALUES 
        ('Bali Beach Resort', 'bali-beach-resort', 1, 499.00, 5, 4, 'active'), 
        ('Paris City Tour', 'paris-city-tour', 2, 850.00, 4, 3, 'active'), 
        ('Swiss Alps Skiing', 'swiss-alps-skiing', 3, 1200.00, 7, 6, 'active')";
    $db->exec($sql);
    echo 'success';
} catch (Exception $e) {
    echo $e->getMessage();
}
