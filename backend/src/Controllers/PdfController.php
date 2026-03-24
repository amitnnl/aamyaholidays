<?php
namespace App\Controllers;

use App\Config\Database;
use Dompdf\Dompdf;
use Dompdf\Options;
use PDO;

class PdfController {
    private $conn;

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    public function generateInvoice($lead_id) {
        $query = "SELECT l.*, p.title as package_title, p.price as package_price, p.days, p.nights 
                  FROM leads l
                  LEFT JOIN packages p ON l.package_id = p.id
                  WHERE l.id = :id LIMIT 1";
                  
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $lead_id);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            $lead = $stmt->fetch(PDO::FETCH_ASSOC);

            // Configure Dompdf options
            $options = new Options();
            $options->set('isHtml5ParserEnabled', true);
            $options->set('isPhpEnabled', true);
            $options->set('defaultFont', 'Helvetica');
            $dompdf = new Dompdf($options);

            // Modern Document HTML structure
            $html = '
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>Invoice - ' . htmlspecialchars($lead['customer_name']) . '</title>
                <style>
                    body { font-family: Helvetica, sans-serif; color: #333; margin: 0; padding: 20px; }
                    .header { border-bottom: 2px solid #0d9488; padding-bottom: 20px; margin-bottom: 40px; }
                    .header h1 { color: #0d9488; margin: 0; font-size: 28px; }
                    .header p { margin: 5px 0 0 0; color: #666; font-size: 14px; }
                    .details { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
                    .details th, .details td { text-align: left; padding: 10px; border-bottom: 1px solid #eee; }
                    .details th { background-color: #f8fafc; color: #0f172a; }
                    .totals { width: 40%; float: right; border-collapse: collapse; }
                    .totals td { padding: 10px; border-bottom: 1px solid #eee; }
                    .totals .final { font-weight: bold; font-size: 18px; color: #0d9488; }
                    .footer { clear: both; margin-top: 60px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999; text-align: center; }
                    .status { font-weight: bold; text-transform: uppercase; color: #0d9488; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Aamya Holidays</h1>
                    <p>Wanderlust unleashed.</p>
                    <div style="float: right; text-align: right; margin-top: -45px;">
                        <h2 style="margin: 0; color: #666;">INVOICE</h2>
                        <p>No: #INV-' . str_pad($lead['id'], 6, '0', STR_PAD_LEFT) . '</p>
                        <p>Date: ' . date('F j, Y', strtotime($lead['created_at'])) . '</p>
                    </div>
                </div>

                <div style="margin-bottom: 40px;">
                    <h3 style="margin-bottom: 5px;">Billed To:</h3>
                    <p style="margin: 0; font-size: 16px;"><strong>' . htmlspecialchars($lead['customer_name']) . '</strong></p>
                    <p style="margin: 5px 0 0 0; color: #666;">Email: ' . htmlspecialchars($lead['customer_email']) . '<br>Phone: ' . htmlspecialchars($lead['customer_phone']) . '</p>
                </div>

                <table class="details">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th>Status</th>
                            <th>Total Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <strong>' . htmlspecialchars($lead['package_title']) . '</strong><br>
                                <span style="font-size: 12px; color: #666;">Itinerary: ' . htmlspecialchars($lead['days']) . ' Days / ' . htmlspecialchars($lead['nights']) . ' Nights</span>
                            </td>
                            <td class="status">' . htmlspecialchars($lead['status']) . '</td>
                            <td>Rs. ' . number_format((float)$lead['package_price'], 2) . '</td>
                        </tr>
                    </tbody>
                </table>

                <table class="totals">
                    <tr>
                        <td>Subtotal</td>
                        <td style="text-align: right;">Rs. ' . number_format((float)$lead['package_price'], 2) . '</td>
                    </tr>
                    <tr>
                        <td class="final">Total Due</td>
                        <td class="final" style="text-align: right;">Rs. ' . number_format((float)$lead['package_price'], 2) . '</td>
                    </tr>
                </table>

                <div class="footer">
                    <p>Thank you for choosing Aamya Holidays. For inquiries, contact concierge@aamya.holidays</p>
                    <p>&copy; ' . date('Y') . ' Aamya Holidays. Generated securely via Private API.</p>
                </div>
            </body>
            </html>';

            $dompdf->loadHtml($html);
            $dompdf->setPaper('A4', 'portrait');
            $dompdf->render();

            // Output the generated PDF to Browser
            $dompdf->stream("Invoice-{$lead['id']}.pdf", array("Attachment" => false));

        } else {
            http_response_code(404);
            echo json_encode(['status' => 'error', 'message' => 'Lead/Invoice not found']);
        }
    }

    public function generateBookingInvoice($booking_ref) {
        $query = "SELECT b.*, p.title as package_title, p.price as package_price, p.days, p.nights, u.name as user_name, u.email as user_email
                  FROM bookings b
                  JOIN packages p ON b.package_id = p.id
                  JOIN users u ON b.user_id = u.id
                  WHERE b.booking_ref = :ref LIMIT 1";
                  
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':ref', $booking_ref);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            $booking = $stmt->fetch(PDO::FETCH_ASSOC);

            // Configure Dompdf options
            $options = new Options();
            $options->set('isHtml5ParserEnabled', true);
            $options->set('isPhpEnabled', true);
            $options->set('defaultFont', 'Helvetica');
            $dompdf = new Dompdf($options);

            $html = '
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>Itinerary - ' . htmlspecialchars($booking['booking_ref']) . '</title>
                <style>
                    body { font-family: Helvetica, sans-serif; color: #333; margin: 0; padding: 20px; }
                    .header { border-bottom: 2px solid #0d9488; padding-bottom: 20px; margin-bottom: 40px; }
                    .header h1 { color: #0d9488; margin: 0; font-size: 28px; }
                    .header p { margin: 5px 0 0 0; color: #666; font-size: 14px; }
                    .details { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
                    .details th, .details td { text-align: left; padding: 10px; border-bottom: 1px solid #eee; }
                    .details th { background-color: #f8fafc; color: #0f172a; }
                    .totals { width: 40%; float: right; border-collapse: collapse; }
                    .totals td { padding: 10px; border-bottom: 1px solid #eee; }
                    .totals .final { font-weight: bold; font-size: 18px; color: #0d9488; }
                    .footer { clear: both; margin-top: 60px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999; text-align: center; }
                    .status { font-weight: bold; text-transform: uppercase; color: #0d9488; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Aamya Holidays</h1>
                    <p>Official Booking Itinerary</p>
                    <div style="float: right; text-align: right; margin-top: -45px;">
                        <h2 style="margin: 0; color: #666;">CONFIRMATION</h2>
                        <p>Ref: #' . htmlspecialchars($booking['booking_ref']) . '</p>
                        <p>Date: ' . date('F j, Y') . '</p>
                    </div>
                </div>

                <div style="margin-bottom: 40px;">
                    <h3 style="margin-bottom: 5px;">Primary Guest:</h3>
                    <p style="margin: 0; font-size: 16px;"><strong>' . htmlspecialchars($booking['user_name']) . '</strong></p>
                    <p style="margin: 5px 0 0 0; color: #666;">Email: ' . htmlspecialchars($booking['user_email']) . '<br>Guests: ' . htmlspecialchars($booking['guests']) . '</p>
                </div>

                <table class="details">
                    <thead>
                        <tr>
                            <th>Package / Destination</th>
                            <th>Check-in Date</th>
                            <th>Amount Paid</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <strong>' . htmlspecialchars($booking['package_title']) . '</strong><br>
                                <span style="font-size: 12px; color: #666;">Duration: ' . htmlspecialchars($booking['days']) . ' Days / ' . htmlspecialchars($booking['nights']) . ' Nights</span>
                            </td>
                            <td>' . htmlspecialchars($booking['check_in_date']) . '</td>
                            <td>Rs. ' . number_format((float)$booking['total_amount'], 2) . '</td>
                        </tr>
                    </tbody>
                </table>

                <table class="totals">
                    <tr>
                        <td class="final">Total Settled</td>
                        <td class="final" style="text-align: right;">Rs. ' . number_format((float)$booking['total_amount'], 2) . '</td>
                    </tr>
                </table>

                <div class="footer">
                    <p>Present this document upon arrival. Need help? concierge@aamya.holidays</p>
                    <p>&copy; ' . date('Y') . ' Aamya Holidays. Generated securely via Private API.</p>
                </div>
            </body>
            </html>';

            $dompdf->loadHtml($html);
            $dompdf->setPaper('A4', 'portrait');
            $dompdf->render();

            $dompdf->stream("Itinerary-{$booking['booking_ref']}.pdf", array("Attachment" => false));

        } else {
            http_response_code(404);
            echo json_encode(['status' => 'error', 'message' => 'Booking not found']); 
        }
    }
}
