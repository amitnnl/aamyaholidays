<?php
namespace App\Controllers;

class UploadController {
    public function store() {
        if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'No file uploaded or upload error.']);
            return;
        }

        $file = $_FILES['image'];
        $uploadDir = __DIR__ . '/../../public/uploads/';
        
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $fileName = uniqid() . '_' . basename($file['name']);
        $fileName = preg_replace('/[^a-zA-Z0-9_\.-]/', '_', $fileName);
        $targetFile = $uploadDir . $fileName;

        // Basic validation
        $imageFileType = strtolower(pathinfo($targetFile, PATHINFO_EXTENSION));
        $validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
        
        if (!in_array($imageFileType, $validExtensions)) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Only JPG, JPEG, PNG, WEBP, SVG & GIF files are allowed.']);
            return;
        }

        if (move_uploaded_file($file['tmp_name'], $targetFile)) {
            $url = 'http://localhost/aamya_holiday/backend/public/uploads/' . $fileName;
            echo json_encode(['status' => 'success', 'url' => $url]);
        } else {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Failed to move uploaded file.']);
        }
    }
}
