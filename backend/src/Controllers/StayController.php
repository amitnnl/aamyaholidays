<?php
namespace App\Controllers;

use App\Config\Database;
use PDO;

class StayController {
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
        $query = "SELECT * FROM stays ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        $stays = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Convert comma separated amenities to arrays for easier frontend parsing
        foreach($stays as &$stay) {
            $stay['amenities'] = explode(',', $stay['amenities']);
        }
        
        $this->jsonResponse('success', 'Stays retrieved successfully', $stays);
    }

    public function show($slug) {
        $query = "SELECT * FROM stays WHERE slug = :slug LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':slug', $slug);
        
        if ($stmt->execute() && $stmt->rowCount() > 0) {
            $stay = $stmt->fetch(PDO::FETCH_ASSOC);
            $stay['amenities'] = explode(',', $stay['amenities']);
            $this->jsonResponse('success', 'Stay retrieved successfully', $stay);
        } else {
            $this->jsonResponse('error', 'Stay not found', null, 404);
        }
    }

    public function store() {
        $data = json_decode(file_get_contents("php://input"));
        
        if (!empty($data->name) && !empty($data->location) && !empty($data->price_per_night)) {
            try {
                // If ID exists, UPDATE. Else, INSERT.
                if (isset($data->id) && $data->id > 0) {
                    $query = "UPDATE stays SET name = :name, slug = :slug, location = :location, description = :description, price_per_night = :price_per_night, rating = :rating, amenities = :amenities, image_url = :image_url WHERE id = :id";
                    $stmt = $this->conn->prepare($query);
                    $stmt->bindParam(':id', $data->id);
                } else {
                    $query = "INSERT INTO stays (name, slug, location, description, price_per_night, rating, amenities, image_url) VALUES (:name, :slug, :location, :description, :price_per_night, :rating, :amenities, :image_url)";
                    $stmt = $this->conn->prepare($query);
                }
                
                $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $data->name)));
                $desc = isset($data->description) ? $data->description : '';
                $rating = isset($data->rating) ? (float)$data->rating : 0.0;
                $amenities = isset($data->amenities) ? implode(',', $data->amenities) : '';
                $image_url = isset($data->image_url) ? $data->image_url : '';
                
                $stmt->bindParam(':name', $data->name);
                $stmt->bindParam(':slug', $slug);
                $stmt->bindParam(':location', $data->location);
                $stmt->bindParam(':description', $desc);
                $stmt->bindParam(':price_per_night', $data->price_per_night);
                $stmt->bindParam(':rating', $rating);
                $stmt->bindParam(':amenities', $amenities);
                $stmt->bindParam(':image_url', $image_url);
                
                if ($stmt->execute()) {
                    $this->jsonResponse('success', 'Stay property saved successfully', null, 201);
                } else {
                    $this->jsonResponse('error', 'Failed to save property', null, 500);
                }
            } catch (\Exception $e) {
                if ($e->getCode() == 23000) {
                    $this->jsonResponse('error', 'A property with this name/slug already exists!', null, 409);
                }
                $this->jsonResponse('error', 'Database error: ' . $e->getMessage(), null, 500);
            }
        } else {
            $this->jsonResponse('error', 'Missing required fields (name, location, price)', null, 400);
        }
    }
}
