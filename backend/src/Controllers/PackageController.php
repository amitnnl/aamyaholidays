<?php
namespace App\Controllers;

use App\Config\Database;
use PDO;

class PackageController {
    private $conn;

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    // Get all public packages
    public function index() {
        $query = "SELECT p.id, p.title, p.slug, p.price, p.days, p.nights, d.name as destination_name, v.name as vendor_name, v.type as vendor_type
                  FROM packages p
                  LEFT JOIN destinations d ON p.destination_id = d.id 
                  LEFT JOIN vendors v ON p.vendor_id = v.id
                  WHERE p.status = 'active'
                  ORDER BY p.id DESC";
                  
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        $packages = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'status' => 'success',
            'data' => $packages
        ]);
    }

    // Get single package details
    public function show($slug) {
        $query = "SELECT p.id, p.title, p.slug, p.price, p.days, p.nights, d.name as destination_name, d.slug as destination_slug, v.name as vendor_name, v.type as vendor_type
                  FROM packages p
                  LEFT JOIN destinations d ON p.destination_id = d.id 
                  LEFT JOIN vendors v ON p.vendor_id = v.id
                  WHERE p.slug = :slug LIMIT 1";
                  
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':slug', $slug);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            $package = $stmt->fetch(PDO::FETCH_ASSOC);
            echo json_encode([
                'status' => 'success',
                'data' => $package
            ]);
        } else {
            http_response_code(404);
            echo json_encode(['status' => 'error', 'message' => 'Package not found']);
        }
    }

    // Create a new package (Admin)
    public function store() {
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (empty($data['title']) || empty($data['slug']) || empty($data['price']) || empty($data['days']) || empty($data['destination_id'])) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Missing required fields']);
            return;
        }

        try {
            if (!empty($data['id'])) {
                $query = "UPDATE packages SET destination_id=:destination_id, vendor_id=:vendor_id, title=:title, slug=:slug, price=:price, days=:days, nights=:nights, status=:status WHERE id=:id";
            } else {
                $query = "INSERT INTO packages (destination_id, vendor_id, title, slug, price, days, nights, status) 
                          VALUES (:destination_id, :vendor_id, :title, :slug, :price, :days, :nights, :status)";
            }
            $stmt = $this->conn->prepare($query);
            
            if (!empty($data['id'])) {
                $stmt->bindParam(':id', $data['id']);
            }
            
            $nights = !empty($data['nights']) ? $data['nights'] : ($data['days'] - 1);
            $status = !empty($data['status']) ? $data['status'] : 'active';
            $vendor_id = !empty($data['vendor_id']) ? $data['vendor_id'] : null;

            $stmt->bindParam(':destination_id', $data['destination_id']);
            $stmt->bindParam(':vendor_id', $vendor_id);
            $stmt->bindParam(':title', $data['title']);
            $stmt->bindParam(':slug', $data['slug']);
            $stmt->bindParam(':price', $data['price']);
            $stmt->bindParam(':days', $data['days']);
            $stmt->bindParam(':nights', $nights);
            $stmt->bindParam(':status', $status);

            if ($stmt->execute()) {
                http_response_code(201);
                echo json_encode(['status' => 'success', 'message' => 'Package processed successfully']);
            } else {
                http_response_code(500);
                echo json_encode(['status' => 'error', 'message' => 'Failed to process package']);
            }
        } catch(\Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Error: ' . $e->getMessage()]);
        }
    }

    public function destroy($id) {
        try {
            $query = "DELETE FROM packages WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id);
            
            if ($stmt->execute()) {
                echo json_encode(['status' => 'success', 'message' => 'Package deleted successfully']);
            } else {
                http_response_code(500);
                echo json_encode(['status' => 'error', 'message' => 'Failed to delete package']);
            }
        } catch(\Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Error: Cannot delete package due to attached bookings or dependencies.']);
        }
    }
}
