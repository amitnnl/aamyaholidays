<?php
// Aamya Holidays Backend - Front Controller

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$request_uri = $_SERVER['REQUEST_URI'];
$base_path = '/aamya_holiday/backend/public';

// Require Composer Autoloader for Dompdf
if (file_exists(__DIR__ . '/../vendor/autoload.php')) {
    require __DIR__ . '/../vendor/autoload.php';
}

// Autoloader for pure PHP OOP
spl_autoload_register(function ($class) {
    // App\Controllers\DestinationController => src/Controllers/DestinationController.php
    $prefix = 'App\\';
    $base_dir = __DIR__ . '/../src/';
    $len = strlen($prefix);
    
    if (strncmp($prefix, $class, $len) !== 0) {
        return;
    }
    
    $relative_class = substr($class, $len);
    $file = $base_dir . str_replace('\\', '/', $relative_class) . '.php';
    
    if (file_exists($file)) {
        require $file;
    }
});

// Remove base path from URI for routing purposes
$path = str_replace($base_path, '', $request_uri);
$path = strtok($path, '?'); // ignore query string

// Route dispatching
if ($path === '/api/destinations') {
    $controller = new \App\Controllers\DestinationController();
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $controller->store();
    } else {
        $controller->index();
    }
} elseif (preg_match('/^\/api\/destinations\/(.+)$/', $path, $matches)) {
    $controller = new \App\Controllers\DestinationController();
    if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        $controller->destroy($matches[1]);
    } else {
        $controller->show($matches[1]);
    }
} elseif ($path === '/api/auth/register') {
    $controller = new \App\Controllers\AuthController();
    $controller->register();
} elseif ($path === '/api/auth/login') {
    $controller = new \App\Controllers\AuthController();
    $controller->login();
} elseif ($path === '/api/auth/update') {
    $controller = new \App\Controllers\AuthController();
    $controller->updateProfile();
} elseif ($path === '/api/packages') {
    $controller = new \App\Controllers\PackageController();
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $controller->store();
    } else {
        $controller->index();
    }
} elseif (preg_match('/^\/api\/packages\/(.+)$/', $path, $matches)) {
    $controller = new \App\Controllers\PackageController();
    if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        $controller->destroy($matches[1]);
    } else {
        $controller->show($matches[1]);
    }
} elseif ($path === '/api/leads') {
    $controller = new \App\Controllers\LeadController();
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $controller->store();
    } else {
        $controller->index();
    }
} elseif ($path === '/api/blog') {
    $controller = new \App\Controllers\BlogController();
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $controller->store();
    } else {
        $controller->index();
    }
} elseif (preg_match('/^\/api\/blog\/(.+)$/', $path, $matches)) {
    $controller = new \App\Controllers\BlogController();
    $controller->show($matches[1]);
} elseif ($path === '/api/vendors') {
    $controller = new \App\Controllers\VendorController();
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $controller->store();
    } else {
        $controller->index();
    }
} elseif (preg_match('/^\/api\/vendors\/(.+)$/', $path, $matches)) {
    $controller = new \App\Controllers\VendorController();
    if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        $controller->destroy($matches[1]);
    }
} elseif (preg_match('/^\/api\/pdf\/invoice\/(.+)$/', $path, $matches)) {
    $controller = new \App\Controllers\PdfController();
    $controller->generateInvoice($matches[1]);
} elseif ($path === '/api/bookings') {
    $controller = new \App\Controllers\BookingController();
    $controller->create();
} elseif ($path === '/api/user/bookings') {
    $controller = new \App\Controllers\BookingController();
    $controller->getUserBookings();
} elseif ($path === '/api/admin/bookings') {
    $controller = new \App\Controllers\BookingController();
    $controller->getAllBookings();
} elseif ($path === '/api/stays') {
    $controller = new \App\Controllers\StayController();
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $controller->store();
    } else {
        $controller->index();
    }
} elseif (preg_match('/^\/api\/stays\/(.+)$/', $path, $matches)) {
    $controller = new \App\Controllers\StayController();
    $controller->show($matches[1]);
} elseif ($path === '/api/favorites') {
    $controller = new \App\Controllers\FavoriteController();
    $controller->toggle();
} elseif ($path === '/api/user/favorites') {
    $controller = new \App\Controllers\FavoriteController();
    $controller->getUserFavorites();
} elseif (preg_match('/^\/api\/pdf\/booking\/(.+)$/', $path, $matches)) {
    $controller = new \App\Controllers\PdfController();
    $controller->generateBookingInvoice($matches[1]);
} elseif ($path === '/api/settings') {
    $controller = new \App\Controllers\SettingController();
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $controller->update();
    } else {
        $controller->index();
    }
} elseif ($path === '/api/pages') {
    $controller = new \App\Controllers\PageController();
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $controller->store();
    } else {
        $controller->index();
    }
} elseif (preg_match('/^\/api\/pages\/(.+)$/', $path, $matches)) {
    $controller = new \App\Controllers\PageController();
    $controller->show($matches[1]);
} elseif ($path === '/api/upload') {
    $controller = new \App\Controllers\UploadController();
    $controller->store();
} else {
    http_response_code(404);
    echo json_encode(['status' => 'error', 'message' => 'Endpoint not found']);
}
