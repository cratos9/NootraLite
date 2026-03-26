<?php
require_once '../User/Remember.php';
require_once '../config/encrypt.php';

$activePage = 'profile';
include '../includes/sidebar.php';

if (empty($_SESSION['user']) || !is_array($_SESSION['user'])) {
    header('Location: ../User/Login.php');
    exit();
}
include 'Views/ProfileView.php';
?>