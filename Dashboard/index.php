<?php
require_once '../includes/Remember.php';
require_once '../config/encrypt.php';
require_once '../includes/lightMode.php';
require_once '../core/IA.php';

// $prompt = "Saluda al usuario y pregúntale cómo puedo ayudarle hoy. el usuario se llama " . $_SESSION['user']['username'] . ".";
// $ia = new IA();
// $response = $ia->Ask($prompt);


if (empty($_SESSION['user']) || !is_array($_SESSION['user'])) {
    header('Location: ../User/Login.php');
    exit();
}

$activePage = 'dashboard';
include '../includes/sidebar.php';
include 'Views/DashboardView.php';
?>