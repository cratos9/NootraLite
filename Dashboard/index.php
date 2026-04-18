<?php
require_once '../includes/Remember.php';
require_once '../config/encrypt.php';
require_once '../includes/lightMode.php';
require_once '../core/IA.php';
require_once '../includes/Mail.php';

// $mail = new Mail();

// $resultado = $mail->send(
//     "correo",
//     "Asunto de prueba",
//     "<h1>Contenido de prueba</h1>"
// );

$activePage = 'dashboard';
include '../includes/sidebar.php';
include 'Views/DashboardView.php';
?>