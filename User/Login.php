<?php

require_once '../Models/UserModel.php';
require_once '../config/db.php';

$database = new Database();

try {
    $conn = $database->connect();
} catch (Exception $e) {
    die('Error en la conexión a la base de datos');
}

$user = new User($conn);

$mensaje = "";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = $_POST['email'];
    $password = $_POST['password'];
    $recordar = isset($_POST['remember']);

    $userInfo = $user->Login($email, $password);

    if ($userInfo) {
        if ($recordar) {
            $token = bin2hex(random_bytes(32));
            setcookie('remember_me', $token, time() + (86400 * 7), "/");
            $sql = "UPDATE users SET remember_token = ?, remember_expires = DATE_ADD(NOW(), INTERVAL 7 DAY) WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->execute([$token, $userInfo['id']]);
        }
        header("Location: ../Dashboard/index.php");
        exit();
    } else {
        $mensaje = "Error al iniciar sesión";
    }
}
include 'Views/LoginView.php';
?>