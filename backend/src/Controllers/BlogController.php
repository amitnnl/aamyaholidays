<?php
namespace App\Controllers;

use App\Config\Database;
use PDO;

class BlogController {
    private $conn;

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    private function jsonResponse($status, $message, $data = null, $statusCode = 200) {
        http_response_code($statusCode);
        echo json_encode(['status' => $status, 'message' => $message, 'data' => $data]);
        exit;
    }

    public function index() {
        $isAdmin = isset($_GET['admin']) && $_GET['admin'] === 'true';
        $query = $isAdmin 
            ? "SELECT id, title, slug, excerpt, image_url, status, published_at FROM blog_posts ORDER BY created_at DESC" 
            : "SELECT id, title, slug, excerpt, image_url, status, published_at FROM blog_posts WHERE status = 'published' ORDER BY published_at DESC";
            
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $this->jsonResponse('success', 'Blogs retrieved', $posts);
    }

    public function show($slug) {
        $query = "SELECT * FROM blog_posts WHERE slug = :slug LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':slug', $slug);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            $post = $stmt->fetch(PDO::FETCH_ASSOC);
            $this->jsonResponse('success', 'Post retrieved', $post);
        } else {
            $this->jsonResponse('error', 'Post not found', null, 404);
        }
    }

    public function store() {
        $data = json_decode(file_get_contents("php://input"));
        
        if (!empty($data->title) && !empty($data->content) && !empty($data->slug)) {
            try {
                if (isset($data->id) && $data->id > 0) {
                    $query = "UPDATE blog_posts SET title = :title, slug = :slug, excerpt = :excerpt, content = :content, image_url = :image_url, status = :status WHERE id = :id";
                    $stmt = $this->conn->prepare($query);
                    $stmt->bindParam(':id', $data->id);
                } else {
                    $query = "INSERT INTO blog_posts (title, slug, excerpt, content, image_url, status, published_at) VALUES (:title, :slug, :excerpt, :content, :image_url, :status, :published_at)";
                    $stmt = $this->conn->prepare($query);
                    
                    if ($data->status === 'published') {
                        $publishedAt = date('Y-m-d H:i:s');
                        $stmt->bindParam(':published_at', $publishedAt);
                    } else {
                        $stmt->bindValue(':published_at', null, PDO::PARAM_NULL);
                    }
                }
                
                $excerpt = isset($data->excerpt) ? $data->excerpt : '';
                $image_url = isset($data->image_url) ? $data->image_url : '';
                
                $stmt->bindParam(':title', $data->title);
                $stmt->bindParam(':slug', $data->slug);
                $stmt->bindParam(':excerpt', $excerpt);
                $stmt->bindParam(':content', $data->content);
                $stmt->bindParam(':image_url', $image_url);
                $stmt->bindParam(':status', $data->status);
                
                if ($stmt->execute()) {
                    // Update published_at explicitly if status switches to published manually on UPDATE
                    if (isset($data->id) && $data->id > 0 && $data->status === 'published') {
                        $this->conn->prepare("UPDATE blog_posts SET published_at = CURRENT_TIMESTAMP WHERE id = :id AND published_at IS NULL")
                             ->execute([':id' => $data->id]);
                    }

                    $this->jsonResponse('success', 'Blog saved successfully', null, 201);
                } else {
                    $this->jsonResponse('error', 'Failed to save blog', null, 500);
                }
            } catch (\Exception $e) {
                if ($e->getCode() == 23000) {
                    $this->jsonResponse('error', 'A blog with this slug already exists!', null, 409);
                }
                $this->jsonResponse('error', 'Database error: ' . $e->getMessage(), null, 500);
            }
        } else {
            $this->jsonResponse('error', 'Missing required fields (title, content, slug)', null, 400);
        }
    }
}
