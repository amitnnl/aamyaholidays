<?php
require_once __DIR__ . '/src/Config/Database.php';
use App\Config\Database;

$db = new Database();
$conn = $db->getConnection();

$contentHtml1 = '<h2>The Hidden Gems of the Alps</h2><p>Switzerland is often characterized by its stunningly perfect chocolates and meticulously engineered timepieces, but its greatest asset lies in the towering, raw geometry of the Alpine mountains.</p><p>We highly recommend visiting Interlaken during the off-season. Not only do you escape the dense tourist crowds, but the crisp alpine air combined with the quiet isolation makes it an unparalleled introspective retreat.</p><h3>Where to stay</h3><p>Avoid the commercial lodge chains. Seek out the family-owned chalets nestled at the high altitudes. They offer an austere authenticity that simply cannot be manufactured.</p>';
$contentHtml2 = '<h2>Digital Nomad Sanctuaries</h2><p>Bali has evolved from a spiritual retreat into the undisputed capital of digital entrepreneurship. But beneath the surface-level matcha cafes and highly-curated Instagram infinity pools lies an ecosystem perfectly suited for deep work and profound rest.</p><h3>The Canggu Protocol</h3><p>Establish your routine early. The humidity peaks at midday, so your most cognitively demanding tasks should occur before 10 AM. Once the afternoon sets in, transition to the coastal beaches for decompression.</p>';

$sql = "INSERT IGNORE INTO blog_posts (title, slug, excerpt, content, image_url, status, published_at) VALUES 
('A Curated Guide to the Swiss Alps', 'swiss-alps-curated-guide', 'Discover the untouched serenity of the high-altitude chalets and the raw geometry of the Alpine mountains.', :c1, 'https://images.unsplash.com/photo-1531063628359-9944062dc1e1?w=800&fit=crop', 'published', CURRENT_TIMESTAMP),
('Bali: Beyond the Digital Nomad Stereotype', 'bali-digital-nomad-stereotype', 'An analytical look into establishing profound routines and deep work amidst the jungle canopies of Indonesia.', :c2, 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&fit=crop', 'published', CURRENT_TIMESTAMP);
";

try {
    $stmt = $conn->prepare($sql);
    $stmt->execute([':c1' => $contentHtml1, ':c2' => $contentHtml2]);
    echo "Blog posts seeded successfully.\n";
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
