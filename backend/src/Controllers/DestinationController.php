<?php
namespace App\Controllers;

use App\Config\Database;
use PDO;

class DestinationController {
    private $conn;

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    public function index() {
        $query = "SELECT id, name, slug, description, image_url, meta_title FROM destinations";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        $destinations = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'status' => 'success',
            'data' => $destinations
        ]);
    }

    public function show($slug) {
        $query = "SELECT id, name, slug, description, image_url, meta_title, meta_description FROM destinations WHERE slug = :slug LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':slug', $slug);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            $destination = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Bring alongside its tour packages
            $query_pkgs = "SELECT id, title, slug, price, days, nights FROM packages WHERE destination_id = :dest_id AND status = 'active'";
            $stmt_pkgs = $this->conn->prepare($query_pkgs);
            $stmt_pkgs->bindParam(':dest_id', $destination['id']);
            $stmt_pkgs->execute();
            $packages = $stmt_pkgs->fetchAll(PDO::FETCH_ASSOC);

            $destination['packages'] = $packages;

            echo json_encode([
                'status' => 'success',
                'data' => $destination
            ]);
        } else {
            http_response_code(404);
            echo json_encode(['status' => 'error', 'message' => 'Destination not found']);
        }
    }

    public function store() {
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (empty($data['name']) || empty($data['slug'])) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Missing required fields']);
            return;
        }

        try {
            if (!empty($data['id'])) {
                $query = "UPDATE destinations SET name=:name, slug=:slug, description=:description, image_url=:image_url, meta_title=:meta_title, meta_description=:meta_description WHERE id=:id";
            } else {
                $query = "INSERT INTO destinations (name, slug, description, image_url, meta_title, meta_description) 
                          VALUES (:name, :slug, :description, :image_url, :meta_title, :meta_description)";
            }
            $stmt = $this->conn->prepare($query);
            
            if (!empty($data['id'])) {
                $stmt->bindParam(':id', $data['id']);
            }
            
            $stmt->bindParam(':name', $data['name']);
            $stmt->bindParam(':slug', $data['slug']);
            $stmt->bindParam(':description', $data['description']);
            $stmt->bindParam(':image_url', $data['image_url']);
            $stmt->bindParam(':meta_title', $data['meta_title']);
            $stmt->bindParam(':meta_description', $data['meta_description']);

            if ($stmt->execute()) {
                http_response_code(201);
                echo json_encode(['status' => 'success', 'message' => 'Destination processed successfully']);
            } else {
                http_response_code(500);
                echo json_encode(['status' => 'error', 'message' => 'Failed to process destination']);
            }
        } catch(\Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Error: ' . $e->getMessage()]);
        }
    }

    public function destroy($id) {
        try {
            $query = "DELETE FROM destinations WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id);
            
            if ($stmt->execute()) {
                echo json_encode(['status' => 'success', 'message' => 'Destination deleted successfully']);
            } else {
                http_response_code(500);
                echo json_encode(['status' => 'error', 'message' => 'Failed to delete destination']);
            }
        } catch(\Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Error: Cannot delete destination if packages are linked to it. Delete packages first.']);
        }
    }
}
