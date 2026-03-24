<?php
namespace App\Controllers;

use App\Config\Database;
use PDO;
use Exception;

class PageController {
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
            $query = "SELECT id, title, slug, is_published, created_at FROM pages ORDER BY created_at DESC";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            $pages = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $this->jsonResponse('success', 'Pages retrieved', $pages);
        } catch (Exception $e) {
            $this->jsonResponse('error', 'Failed to retrieve pages: ' . $e->getMessage(), null, 500);
        }
    }

    public function show($slug) {
        try {
            $query = "SELECT * FROM pages WHERE slug = :slug LIMIT 1";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':slug', $slug);
            $stmt->execute();
            
            if ($stmt->rowCount() > 0) {
                $page = $stmt->fetch(PDO::FETCH_ASSOC);
                $this->jsonResponse('success', 'Page retrieved', $page);
            } else {
                $this->jsonResponse('error', 'Page not found', null, 404);
            }
        } catch (Exception $e) {
            $this->jsonResponse('error', 'Database error: ' . $e->getMessage(), null, 500);
        }
    }

    public function store() {
        $data = json_decode(file_get_contents("php://input"));
        
        if (!empty($data->title) && !empty($data->content) && !empty($data->slug)) {
            try {
                // If ID is present, we UPDATE. If not, we INSERT.
                if (isset($data->id) && $data->id > 0) {
                    $query = "UPDATE pages SET title = :title, slug = :slug, content = :content, meta_description = :meta_description, is_published = :is_published WHERE id = :id";
                    $stmt = $this->conn->prepare($query);
                    $stmt->bindParam(':id', $data->id);
                } else {
                    $query = "INSERT INTO pages (title, slug, content, meta_description, is_published) VALUES (:title, :slug, :content, :meta_description, :is_published)";
                    $stmt = $this->conn->prepare($query);
                }
                
                $is_published = isset($data->is_published) ? (int)$data->is_published : 1;
                $meta_desc = isset($data->meta_description) ? $data->meta_description : '';
                
                $stmt->bindParam(':title', $data->title);
                $stmt->bindParam(':slug', $data->slug);
                $stmt->bindParam(':content', $data->content);
                $stmt->bindParam(':meta_description', $meta_desc);
                $stmt->bindParam(':is_published', $is_published);
                
                if ($stmt->execute()) {
                    $this->jsonResponse('success', 'Page saved successfully', null, 201);
                } else {
                    $this->jsonResponse('error', 'Failed to save page', null, 500);
                }
            } catch (Exception $e) {
                if ($e->getCode() == 23000) { // Integrity constraint violation (duplicate slug)
                    $this->jsonResponse('error', 'A page with this slug already exists!', null, 409);
                }
                $this->jsonResponse('error', 'Database error: ' . $e->getMessage(), null, 500);
            }
        } else {
            $this->jsonResponse('error', 'Missing required fields (title, slug, content)', null, 400);
        }
    }
}
