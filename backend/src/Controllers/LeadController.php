<?php
namespace App\Controllers;

use App\Config\Database;
use PDO;
use Exception;

class LeadController {
    private $conn;

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    // Get all leads (Admin)
    public function index() {
        $query = "SELECT l.id, l.customer_name, l.customer_email, l.status, l.created_at, p.title as package_title 
                  FROM leads l
                  LEFT JOIN packages p ON l.package_id = p.id
                  ORDER BY l.id DESC";
                  
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        $leads = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'status' => 'success',
            'data' => $leads
        ]);
    }

    // Submit a new lead/inquiry
    public function store() {
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (empty($data['customer_name']) || empty($data['customer_email']) || empty($data['notes'])) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Missing required fields']);
            return;
        }

        try {
            $query = "INSERT INTO leads (package_id, customer_name, customer_email, customer_phone, notes, status) 
                      VALUES (:package_id, :name, :email, :phone, :notes, 'new')";
            $stmt = $this->conn->prepare($query);
            
            $package_id = !empty($data['package_id']) ? $data['package_id'] : null;
            $phone = !empty($data['customer_phone']) ? $data['customer_phone'] : null;

            $stmt->bindParam(':package_id', $package_id);
            $stmt->bindParam(':name', $data['customer_name']);
            $stmt->bindParam(':email', $data['customer_email']);
            $stmt->bindParam(':phone', $phone);
            $stmt->bindParam(':notes', $data['notes']);

            if ($stmt->execute()) {
                // Alert Admin via Email configured in DB settings
                $stmtCheck = $this->conn->prepare("SELECT setting_value FROM site_settings WHERE setting_key = 'contact_email'");
                $stmtCheck->execute();
                $adminEmail = $stmtCheck->fetchColumn();
                
                if ($adminEmail) {
                    $subject = "New Customer Lead: " . $data['customer_name'];
                    $message = "You have received a new inquiry.\n\nName: " . $data['customer_name'] . "\nEmail: " . $data['customer_email'] . "\nPhone: " . $phone . "\nNotes: " . $data['notes'] . "\n\nPlease login to your admin dashboard to reply.";
                    $headers = "From: notifications@aamyaholidays.com\r\nReply-To: " . $data['customer_email'] . "\r\nX-Mailer: PHP/" . phpversion();
                    @mail($adminEmail, $subject, $message, $headers);
                }

                http_response_code(201);
                echo json_encode(['status' => 'success', 'message' => 'Inquiry submitted successfully']);
            } else {
                http_response_code(500);
                echo json_encode(['status' => 'error', 'message' => 'Failed to submit inquiry']);
            }
        } catch(Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'An error occurred processing your request']);
        }
    }
}
