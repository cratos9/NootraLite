<?php

require_once '../includes/Remember.php';
require_once '../Models/UserModel.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $database = new Database();
    try {
        $conn = $database->connect();
    } catch (Exception $e) {
        die('Error en la conexión a la base de datos');
    }

    $user = new User($conn);
    
    $email = $_POST['email'] ?? null;
    $userId = $_SESSION['user']['id'] ?? null;

    if ($email && $userId) {
        $user->DisableTwoFactor($userId);
        $_SESSION['user']['is_two_factor_enabled'] = false;
        header('Location: Profile.php?message=two_factor_disabled');
        exit;
    }
}

?>