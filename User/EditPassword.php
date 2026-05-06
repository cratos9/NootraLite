<?php

require_once '../includes/Remember.php';
require_once '../Models/UserModel.php';
require_once '../includes/lightMode.php';

$activePage = 'profile';

$database = new Database();
try {
    $conn = $database->connect();
} catch (Exception $e) {
    die('Error en la conexión a la base de datos');
}
$user = new User($conn);

if ($_SERVER['REQUEST_METHOD'] === 'POST'){
    $id = $_SESSION['user']['id'];
    $password = trim($_POST['password'] ?? '');
    $new_password = trim($_POST['new_password'] ?? '');
    $confirm_new_password = trim($_POST['confirm_new_password'] ?? '');
    
    $errors = [];

    if (empty($password)) {
        $errors['password'] = 'Por favor, ingresa tu contraseña actual para confirmar.';
    }

    if ($new_password === '') {
        $errors['new_password'] = 'La nueva contraseña es obligatoria.';
    } elseif (strlen($new_password) < 8) {
        $errors['new_password'] = 'La contraseña debe tener al menos 8 caracteres.';
    } elseif (!preg_match('/[A-Z]/', $new_password) || !preg_match('/[a-z]/', $new_password) || !preg_match('/\d/', $new_password)) {
        $errors['new_password'] = 'La contraseña debe incluir mayúscula, minúscula y número.';
    }

    if ($confirm_new_password === '') {
        $errors['confirm_new_password'] = 'Confirma tu nueva contraseña.';
    } elseif ($new_password !== $confirm_new_password) {
        $errors['confirm_new_password'] = 'Las contraseñas no coinciden.';
    }

    if (empty($errors)) {
        $response = $user->UpdatePassword($id, $password, $new_password);
        if ($response != false){
            session_destroy();
            header('Location: ../index.php');
        } else {
            $errors['password'] = 'Contraseña actual incorrecta. Inténtalo de nuevo.';
        }
    }

    }
    
    include 'Views/EditPasswordView.php';
    if (!empty($errors)) {
        $mensaje = '';
        foreach ($errors as $error) {
            echo '
            <script>
            message.error("' . $error . '");
            </script>
            ';
        }
    }
?>