<?php
require_once '../includes/Remember.php';
require_once '../config/encrypt.php';
require_once '../includes/lightMode.php';

$activePage = 'profile';
include '../includes/sidebar.php';

if (empty($_SESSION['user']) || !is_array($_SESSION['user'])) {
    header('Location: ../User/Login.php');
    exit();
}
include 'Views/ProfileView.php';
?>