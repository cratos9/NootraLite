<?php
require_once '../includes/Remember.php';
require_once '../config/encrypt.php';
require_once '../includes/lightMode.php';
require_once '../core/IA.php';
require_once '../includes/Mail.php';


if (empty($_SESSION['user']) || !is_array($_SESSION['user'])) {
    header('Location: ../User/Login.php');
    exit();
}

$activePage = 'dashboard';
include '../includes/sidebar.php';
include 'Views/DashboardView.php';
?>