<?php

require_once '../includes/Remember.php';
require_once '../Models/UserModel.php';
require_once '../includes/lightMode.php';

$activePage = 'profile';
include '../includes/sidebar.php';

$database = new Database();
try {
    $conn = $database->connect();
} catch (Exception $e) {
    die('Error en la conexión a la base de datos');
}
$user = new User($conn);

if ($_SERVER['REQUEST_METHOD'] === 'POST'){
    $id = $_SESSION['user']['id'];
    $password = $_POST['password'];

    if (empty($password)) {
        $mensaje = "Por favor, ingresa tu contraseña para confirmar.";
        include 'Views/DeleteAccountView.php';
        exit();
    }

    $response = $user->DeleteAccount($id, $password);
    if ($response != false){
        session_destroy();
        header('Location: ../index.php');
    } else {
        $mensaje = "Contraseña incorrecta. Inténtalo de nuevo.";
    }
}

include 'Views/DeleteAccountView.php';
?>