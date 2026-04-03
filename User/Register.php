<?php

require_once '../Models/UserModel.php';
require_once '../config/db.php';

$database = new Database();

try {
    $conn = $database->connect();
} catch (Exception $e) {
    die('Error en la conexión a la base de datos');
}

$usuario = new User($conn);

$mensaje = "";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $fullname = $_POST['fullname'];
    $email = $_POST['email'];
    $password = $_POST['password'];
    $password_confirm = $_POST['confirm_password'];
    $username = $_POST['username'];

    if ($password !== $password_confirm) {
        $mensaje = "Las contraseñas no coinciden";
    } elseif ($usuario->Register($fullname, $email, $password, $username)) {
        header('Location: Login.php');
        exit();
    } else {
        $mensaje = "Error al registrar";
    }
} 
include 'Views/RegisterView.php';
?>