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
$isTwoFactorEnabled = $user->isTwoFactorEnabled($userId);

include 'Views/ProfileView.php';
if (!$isVerified){
    echo '
    <script>
    message.error("No estas verificado");
    </script>';
    }

if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['message'])) {
    $message = $_GET['message'];
    if ($message === 'two_factor_enabled') {
        echo '
        <script>
        message.success("Autenticación de dos factores activada");
        </script>';
    } elseif ($message === 'two_factor_disabled') {
        echo '
        <script>
        message.success("Autenticación de dos factores desactivada");
        </script>';
    }
}
?>