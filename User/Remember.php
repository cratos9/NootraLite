<?php
require_once '../config/db.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (!isset($_SESSION['user']) && isset($_COOKIE['remember_me'])) {
    $database = new Database();

    try {
        $conn = $database->connect();
    } catch (Exception $e) {
        error_log('Error en la conexión a la base de datos: ' . $e->getMessage());
        return;
    }

    $token = $_COOKIE['remember_me'];
    $sql = "SELECT * FROM users WHERE remember_token = ? AND remember_expires > NOW()";
    $stmt = $conn->prepare($sql);
    $stmt->execute([$token]);
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($usuario) {
        $_SESSION['user'] = $usuario;
    } else {
        setcookie('remember_me', '', time() - 3600, "/");
    }
}