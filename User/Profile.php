<?php
require_once '../includes/Remember.php';
require_once '../config/encrypt.php';
require_once '../includes/lightMode.php';
require_once '../Models/UserModel.php';

$database = new Database();
try {
    $conn = $database->connect();
} catch (Exception $e) {
    die('Error en la conexión a la base de datos');
}

$user = new User($conn);

$userId = $_SESSION['user']['id'] ?? null;

$isVerified = $_SESSION['user']['is_verified'];

$activePage = 'profile';
include '../includes/sidebar.php';

include 'Views/ProfileView.php';
?>