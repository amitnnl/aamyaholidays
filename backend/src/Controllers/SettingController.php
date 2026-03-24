<?php
namespace App\Controllers;

use App\Config\Database;
use PDO;
use Exception;

class SettingController {
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

    public function index() {
        try {
            $query = "SELECT setting_key, setting_value FROM site_settings";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            
            $settings = [];
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $settings[$row['setting_key']] = $row['setting_value'];
            }
            
            $this->jsonResponse('success', 'Site settings retrieved', $settings);
        } catch (Exception $e) {
            $this->jsonResponse('error', 'Database error: ' . $e->getMessage(), null, 500);
        }
    }

    public function update() {
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (is_array($data) && !empty($data)) {
            try {
                $this->conn->beginTransaction();
                
                $query = "INSERT INTO site_settings (setting_key, setting_value) 
                          VALUES (:key, :val) 
                          ON DUPLICATE KEY UPDATE setting_value = :val";
                          
                $stmt = $this->conn->prepare($query);
                
                foreach ($data as $key => $val) {
                    // Only update known/valid settings to prevent arbitrary string injection
                    $allowed_keys = ['site_name', 'logo_url', 'logo_text', 'hero_heading', 'hero_subheading', 'hero_bg_image', 'contact_email', 'contact_phone', 'whatsapp_number', 'footer_text', 'primary_color', 'social_facebook', 'social_instagram', 'social_twitter'];
                    
                    if (in_array($key, $allowed_keys)) {
                        $stmt->bindParam(':key', $key);
                        $stmt->bindParam(':val', $val);
                        $stmt->execute();
                    }
                }
                
                $this->conn->commit();
                $this->jsonResponse('success', 'Settings updated successfully.', $data);
            } catch (Exception $e) {
                $this->conn->rollBack();
                $this->jsonResponse('error', 'Database update failed: ' . $e->getMessage(), null, 500);
            }
        } else {
            $this->jsonResponse('error', 'No valid data provided.', null, 400);
        }
    }
}
