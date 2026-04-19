<?php

require_once '../Models/UserModel.php';
require_once '../includes/lightMode.php';
require_once '../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    header('Location: ../index.php');
    exit();
}

$email = $_GET['email'] ?? null;
$token = $_GET['token'] ?? null;

if (!$email || !$token) {
    header('Location: ../index.php');
    exit();
}

$database = new Database();

try {
    $conn = $database->connect();
} catch (Exception $e) {
    die('Error en la conexión a la base de datos');
}

$user = new User($conn);

$isValid = $user->GetVerificationToken($email, $token);

if ($isValid) {
    $verify = $user->VerifyEmail($email);
    if (!$verify) {
        die('Error al verificar el correo');
    }

    $userVerified = "Te has verificado correctamente, ya puedes iniciar sesion.";
} else {
    $userVerified = "El enlace de verificación no es válido o ha expirado.";
}

include 'Views/VerifyEmailView.php';

?>