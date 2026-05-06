<?php
require_once '../includes/Remember.php';
require_once '../config/encrypt.php';
require_once '../includes/lightMode.php';
require_once '../Models/UserModel.php';

$activePage = 'profile';

$database = new Database();
try {
    $conn = $database->connect();
} catch (Exception $e) {
    die('Error en la conexión a la base de datos');
}

$user = new User($conn);

$userId = $_SESSION['user']['id'] ?? null;

$isVerified = $_SESSION['user']['is_verified'];
include 'Views/ProfileView.php';
if (!$isVerified){
    echo '
    <script>
    message.error("No estas verificado");
    </script>';
    }
?>