<?php
namespace App\Controllers;

use App\Config\Database;
use PDO;
use Exception;

class VendorController {
    private $conn;

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    // Get all vendors (Admin)
    public function index() {
        $query = "SELECT id, name, type, contact_email, contact_phone, status, created_at FROM vendors ORDER BY id DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        $vendors = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'status' => 'success',
            'data' => $vendors
        ]);
    }

    // Create a new vendor (Admin)
    public function store() {
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (empty($data['name']) || empty($data['type'])) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Missing required fields']);
            return;
        }

        try {
            if (!empty($data['id'])) {
                $query = "UPDATE vendors SET name=:name, type=:type, contact_email=:contact_email, contact_phone=:contact_phone, status=:status WHERE id=:id";
            } else {
                $query = "INSERT INTO vendors (name, type, contact_email, contact_phone, status) 
                          VALUES (:name, :type, :contact_email, :contact_phone, :status)";
            }
            $stmt = $this->conn->prepare($query);
            
            if (!empty($data['id'])) {
                $stmt->bindParam(':id', $data['id']);
            }
            
            $status = !empty($data['status']) ? $data['status'] : 'active';
            $email = !empty($data['contact_email']) ? $data['contact_email'] : null;
            $phone = !empty($data['contact_phone']) ? $data['contact_phone'] : null;

            $stmt->bindParam(':name', $data['name']);
            $stmt->bindParam(':type', $data['type']);
            $stmt->bindParam(':contact_email', $email);
            $stmt->bindParam(':contact_phone', $phone);
            $stmt->bindParam(':status', $status);

            if ($stmt->execute()) {
                http_response_code(201);
                echo json_encode(['status' => 'success', 'message' => 'Vendor processed successfully']);
            } else {
                http_response_code(500);
                echo json_encode(['status' => 'error', 'message' => 'Failed to process vendor']);
            }
        } catch(\Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Error: ' . $e->getMessage()]);
        }
    }

    public function destroy($id) {
        try {
            $query = "DELETE FROM vendors WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id);
            
            if ($stmt->execute()) {
                echo json_encode(['status' => 'success', 'message' => 'Vendor deleted successfully']);
            } else {
                http_response_code(500);
                echo json_encode(['status' => 'error', 'message' => 'Failed to delete vendor']);
            }
        } catch(\Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Error: Cannot delete vendor if packages are linked to it. Delete packages first.']);
        }
    }
}
