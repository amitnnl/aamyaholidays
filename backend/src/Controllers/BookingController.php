<?php
namespace App\Controllers;

use App\Config\Database;
use PDO;
use Exception;

class BookingController {
    private $conn;

    public function __construct() {
        $db = new Database();
        $this->conn = $db->getConnection();
    }

    // Standard JSON response
    private function jsonResponse($status, $message, $data = null, $statusCode = 200) {
        http_response_code($statusCode);
        echo json_encode(['status' => $status, 'message' => $message, 'data' => $data]);
        exit;
    }

    public function create() {
        $data = json_decode(file_get_contents("php://input"));

        if (!empty($data->user_id) && !empty($data->package_id) && !empty($data->check_in_date)) {
            try {
                // Generate a unique booking reference
                $booking_ref = 'AH-' . rand(100000, 999999);

                $query = "INSERT INTO bookings 
                            (user_id, package_id, check_in_date, guests, primary_guest_name, total_amount, status, booking_ref) 
                          VALUES 
                            (:user_id, :package_id, :check_in_date, :guests, :primary_guest_name, :total_amount, 'Confirmed', :booking_ref)";
                
                $stmt = $this->conn->prepare($query);
                
                $stmt->bindParam(":user_id", $data->user_id);
                $stmt->bindParam(":package_id", $data->package_id);
                $stmt->bindParam(":check_in_date", $data->check_in_date);
                $stmt->bindParam(":guests", $data->guests);
                $stmt->bindParam(":primary_guest_name", $data->primary_guest_name);
                $stmt->bindParam(":total_amount", $data->total_amount);
                $stmt->bindParam(":booking_ref", $booking_ref);

                if ($stmt->execute()) {
                    // Alert Admin via Email configured in DB settings
                    $stmtCheck = $this->conn->prepare("SELECT setting_value FROM site_settings WHERE setting_key = 'contact_email'");
                    $stmtCheck->execute();
                    $adminEmail = $stmtCheck->fetchColumn();
                    
                    if ($adminEmail) {
                        $subject = "New Package Booking Alert: " . $booking_ref;
                        $message = "A new high-ticket booking has just been submitted on your platform.\n\nReference: " . $booking_ref . "\nName: " . $data->primary_guest_name . "\nGuests: " . $data->guests . "\nAmount: ₹" . $data->total_amount . "\n\nPlease login to your admin panel to view full details.";
                        $headers = "From: notifications@aamyaholidays.com\r\nReply-To: noreply@aamyaholidays.com\r\nX-Mailer: PHP/" . phpversion();
                        @mail($adminEmail, $subject, $message, $headers);
                    }

                    $this->jsonResponse('success', 'Booking Confirmed.', ['booking_ref' => $booking_ref], 201);
                } else {
                    $this->jsonResponse('error', 'Unable to process booking.', null, 503);
                }
            } catch (Exception $e) {
                $this->jsonResponse('error', 'Database error: ' . $e->getMessage(), null, 500);
            }
        } else {
            $this->jsonResponse('error', 'Incomplete data.', null, 400);
        }
    }

    public function getUserBookings() {
        if (!isset($_GET['user_id'])) {
            $this->jsonResponse('error', 'User ID required', null, 400);
        }

        $userId = $_GET['user_id'];
        
        $query = "SELECT b.*, p.title as package_name, d.name as destination_name, p.days, p.price as item_price, d.image_url
                  FROM bookings b 
                  JOIN packages p ON b.package_id = p.id 
                  LEFT JOIN destinations d ON p.destination_id = d.id
                  WHERE b.user_id = :user_id
                  ORDER BY b.created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $userId);
        $stmt->execute();
        
        $bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $this->jsonResponse('success', 'User bookings retrieved', $bookings);
    }

    public function getAllBookings() {
        $query = "SELECT b.*, p.title as package_name, u.name as user_name, u.email as user_email
                  FROM bookings b 
                  JOIN packages p ON b.package_id = p.id 
                  LEFT JOIN users u ON b.user_id = u.id
                  ORDER BY b.created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        $bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $this->jsonResponse('success', 'All bookings retrieved', $bookings);
    }
}
