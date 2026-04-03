<?php
require_once '../Models/UserModel.php';
require_once '../config/db.php';
require_once '../includes/Remember.php';

$database = new Database();
try {
    $conn = $database->connect();
} catch (Exception $e) {
    die('Error en la conexión a la base de datos');
}

$user = new User($conn);
$user->Logout();
?>