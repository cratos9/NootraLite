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

$message = "";
$messageType = "";
$isSuccess = false;
$tokenInvalid = false;

$userId = isset($_GET['uid']) ? (int) $_GET['uid'] : (int) ($_POST['uid'] ?? 0);
$token = trim((string) ($_GET['token'] ?? ($_POST['token'] ?? '')));

if ($userId <= 0 || $token === '') {
    $tokenInvalid = true;
    $message = 'El enlace de recuperacion no es valido.';
    $messageType = 'error';
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && !$tokenInvalid) {
    $newPassword = (string) ($_POST['password'] ?? '');
    $confirmPassword = (string) ($_POST['confirm_password'] ?? '');

    if ($newPassword === '') {
        $message = 'La contrasena es obligatoria.';
        $messageType = 'error';
    } elseif (strlen($newPassword) < 8) {
        $message = 'La contrasena debe tener al menos 8 caracteres.';
        $messageType = 'error';
    } elseif (!preg_match('/[A-Z]/', $newPassword) || !preg_match('/[a-z]/', $newPassword) || !preg_match('/\d/', $newPassword)) {
        $message = 'La contrasena debe incluir mayuscula, minuscula y numero.';
        $messageType = 'error';
    }

    if ($confirmPassword === '') {
        $message = 'Confirma tu contrasena.';
        $messageType = 'error';
    } elseif ($newPassword !== $confirmPassword) {
        $message = 'Las contrasenas no coinciden.';
        $messageType = 'error';
    }

    if (empty($errors)) {
        if ($user->ResetPassword($userId, $token, $newPassword)) {
            $isSuccess = true;
            $message = 'Tu contrasena se actualizo correctamente. Ya puedes iniciar sesion.';
            $messageType = 'tip';
        } else {
            $tokenInvalid = true;
            $message = 'El enlace es invalido o ya expiro. Solicita uno nuevo.';
            $messageType = 'error';
        }
    }
}

include 'Views/NewPasswordView.php';
if ($message) {
    echo '
    <script>
    message.' . $messageType . '("' . $message . '");
    </script>';
}
?>