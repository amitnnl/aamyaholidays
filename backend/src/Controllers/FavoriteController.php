<?php
namespace App\Controllers;

use App\Config\Database;
use PDO;
use Exception;

class FavoriteController {
    private $conn;

    public function __construct() {
        $db = new Database();
        $this->conn = $db->getConnection();
    }

    private function jsonResponse($status, $message, $data = null, $statusCode = 200) {
        http_response_code($statusCode);
        echo json_encode(['status' => $status, 'message' => $message, 'data' => $data]);
        exit;
    }

    public function toggle() {
        $data = json_decode(file_get_contents("php://input"));

        if (!empty($data->user_id) && !empty($data->item_type) && !empty($data->item_id)) {
            try {
                // Check if it already exists
                $checkQuery = "SELECT id FROM favorites WHERE user_id = :userId AND item_type = :itemType AND item_id = :itemId LIMIT 1";
                $checkStmt = $this->conn->prepare($checkQuery);
                $checkStmt->bindParam(":userId", $data->user_id);
                $checkStmt->bindParam(":itemType", $data->item_type);
                $checkStmt->bindParam(":itemId", $data->item_id);
                $checkStmt->execute();

                if ($checkStmt->rowCount() > 0) {
                    // Exists, so remove it (Toggle Off)
                    $deleteQuery = "DELETE FROM favorites WHERE user_id = :userId AND item_type = :itemType AND item_id = :itemId";
                    $deleteStmt = $this->conn->prepare($deleteQuery);
                    $deleteStmt->bindParam(":userId", $data->user_id);
                    $deleteStmt->bindParam(":itemType", $data->item_type);
                    $deleteStmt->bindParam(":itemId", $data->item_id);
                    
                    if ($deleteStmt->execute()) {
                        $this->jsonResponse('success', 'Removed from favorites.', ['action' => 'removed'], 200);
                    }
                } else {
                    // Doesn't exist, so add it (Toggle On)
                    $insertQuery = "INSERT INTO favorites (user_id, item_type, item_id) VALUES (:userId, :itemType, :itemId)";
                    $insertStmt = $this->conn->prepare($insertQuery);
                    $insertStmt->bindParam(":userId", $data->user_id);
                    $insertStmt->bindParam(":itemType", $data->item_type);
                    $insertStmt->bindParam(":itemId", $data->item_id);
                    
                    if ($insertStmt->execute()) {
                        $this->jsonResponse('success', 'Added to favorites.', ['action' => 'added'], 201);
                    }
                }

                $this->jsonResponse('error', 'Unable to process favorite action.', null, 503);
                
            } catch (Exception $e) {
                $this->jsonResponse('error', 'Database error: ' . $e->getMessage(), null, 500);
            }
        } else {
            $this->jsonResponse('error', 'Incomplete data.', null, 400);
        }
    }

    public function getUserFavorites() {
        if (!isset($_GET['user_id'])) {
            $this->jsonResponse('error', 'User ID required', null, 400);
        }

        $userId = $_GET['user_id'];
        
        try {
            // Get Packages
            $queryPackages = "
                SELECT f.id as fav_id, f.item_type, f.item_id, p.title as name, p.slug, p.price, p.image_url 
                FROM favorites f 
                JOIN packages p ON f.item_id = p.id 
                WHERE f.user_id = :userId AND f.item_type = 'package'
            ";
            $stmtPackages = $this->conn->prepare($queryPackages);
            $stmtPackages->bindParam(':userId', $userId);
            $stmtPackages->execute();
            $packages = $stmtPackages->fetchAll(PDO::FETCH_ASSOC);

            // Get Stays
            $queryStays = "
                SELECT f.id as fav_id, f.item_type, f.item_id, s.name, s.slug, s.price_per_night as price, s.image_url 
                FROM favorites f 
                JOIN stays s ON f.item_id = s.id 
                WHERE f.user_id = :userId AND f.item_type = 'stay'
            ";
            $stmtStays = $this->conn->prepare($queryStays);
            $stmtStays->bindParam(':userId', $userId);
            $stmtStays->execute();
            $stays = $stmtStays->fetchAll(PDO::FETCH_ASSOC);

            // Combine and sort by newest favorite (though we'd need fav created_at for true sort, merging is fine here)
            $favorites = array_merge($packages, $stays);

            $this->jsonResponse('success', 'User favorites retrieved', $favorites);
        } catch (Exception $e) {
            $this->jsonResponse('error', 'Database error: ' . $e->getMessage(), null, 500);
        }
    }
}
