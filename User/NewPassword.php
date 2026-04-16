<?php

require_once '../Models/UserModel.php';
require_once '../config/db.php';

$database = new Database();

try {
    $conn = $database->connect();
} catch (Exception $e) {
    die('Error en la conexion a la base de datos');
}

$user = new User($conn);

$mensaje = '';
$errors = [];
$isSuccess = false;
$tokenInvalid = false;

$userId = isset($_GET['uid']) ? (int) $_GET['uid'] : (int) ($_POST['uid'] ?? 0);
$token = trim((string) ($_GET['token'] ?? ($_POST['token'] ?? '')));

if ($userId <= 0 || $token === '') {
    $tokenInvalid = true;
    $mensaje = 'El enlace de recuperacion no es valido.';
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && !$tokenInvalid) {
    $newPassword = (string) ($_POST['password'] ?? '');
    $confirmPassword = (string) ($_POST['confirm_password'] ?? '');

    if ($newPassword === '') {
        $errors['password'] = 'La contrasena es obligatoria.';
    } elseif (strlen($newPassword) < 8) {
        $errors['password'] = 'La contrasena debe tener al menos 8 caracteres.';
    } elseif (!preg_match('/[A-Z]/', $newPassword) || !preg_match('/[a-z]/', $newPassword) || !preg_match('/\d/', $newPassword)) {
        $errors['password'] = 'La contrasena debe incluir mayuscula, minuscula y numero.';
    }

    if ($confirmPassword === '') {
        $errors['confirm_password'] = 'Confirma tu contrasena.';
    } elseif ($newPassword !== $confirmPassword) {
        $errors['confirm_password'] = 'Las contrasenas no coinciden.';
    }

    if (empty($errors)) {
        if ($user->ResetPassword($userId, $token, $newPassword)) {
            $isSuccess = true;
            $mensaje = 'Tu contrasena se actualizo correctamente. Ya puedes iniciar sesion.';
        } else {
            $tokenInvalid = true;
            $mensaje = 'El enlace es invalido o ya expiro. Solicita uno nuevo.';
        }
    }
}

include 'Views/NewPasswordView.php';
?>