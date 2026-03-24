<?php
namespace App\Controllers;

use App\Config\Database;
use PDO;
use Exception;

class AuthController {
    private $conn;

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    // Since we are using pure PHP, we can use simple sessions or JWT
    // For now we will return straightforward statuses

    public function register() {
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (empty($data['name']) || empty($data['email']) || empty($data['password'])) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Missing fields']);
            return;
        }

        try {
            $query = "INSERT INTO users (name, email, password, role) VALUES (:name, :email, :password, :role)";
            $stmt = $this->conn->prepare($query);
            
            $stmt->bindParam(':name', $data['name']);
            $stmt->bindParam(':email', $data['email']);
            
            // Using password_hash for security
            $hash = password_hash($data['password'], PASSWORD_BCRYPT);
            $stmt->bindParam(':password', $hash);
            
            $role = isset($data['role']) ? $data['role'] : 'customer';
            $stmt->bindParam(':role', $role);

            if ($stmt->execute()) {
                http_response_code(201);
                echo json_encode(['status' => 'success', 'message' => 'User registered']);
            } else {
                http_response_code(500);
                echo json_encode(['status' => 'error', 'message' => 'Registration failed']);
            }
        } catch(Exception $e) {
            http_response_code(409); // Conflict (likely duplicate email)
            echo json_encode(['status' => 'error', 'message' => 'Email might already be taken']);
        }
    }

    public function login() {
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (empty($data['email']) || empty($data['password'])) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Missing fields']);
            return;
        }

        $query = "SELECT id, name, email, password, role FROM users WHERE email = :email";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':email', $data['email']);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            if (password_verify($data['password'], $user['password'])) {
                // Return simple token/session mechanism
                echo json_encode([
                    'status' => 'success',
                    'message' => 'Login successful',
                    'user' => [
                        'id' => $user['id'],
                        'name' => $user['name'],
                        'email' => $user['email'],
                        'role' => $user['role']
                    ]
                ]);
            } else {
                http_response_code(401);
                echo json_encode(['status' => 'error', 'message' => 'Invalid password']);
            }
        } else {
            http_response_code(404);
            echo json_encode(['status' => 'error', 'message' => 'User not found']);
        }
    }

    public function updateProfile() {
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (empty($data['id']) || empty($data['name']) || empty($data['email'])) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Missing ID, name or email']);
            return;
        }

        try {
            // Check if email belongs to someone else
            $check = $this->conn->prepare("SELECT id FROM users WHERE email = :email AND id != :id");
            $check->execute([':email' => $data['email'], ':id' => $data['id']]);
            if ($check->rowCount() > 0) {
                http_response_code(409);
                echo json_encode(['status' => 'error', 'message' => 'Email is already taken by another account.']);
                return;
            }

            $query = "UPDATE users SET name = :name, email = :email WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':name', $data['name']);
            $stmt->bindParam(':email', $data['email']);
            $stmt->bindParam(':id', $data['id']);

            if ($stmt->execute()) {
                http_response_code(200);
                echo json_encode([
                    'status' => 'success',
                    'message' => 'Profile updated successfully',
                    'user' => [
                        'id' => $data['id'],
                        'name' => $data['name'],
                        'email' => $data['email'],
                        'role' => $data['role']
                    ]
                ]);
            } else {
                http_response_code(500);
                echo json_encode(['status' => 'error', 'message' => 'Failed to update user']);
            }
        } catch(Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Database error']);
        }
    }
}
