<?php
require_once '../User/Remember.php';

if (empty($_SESSION['user']) || !is_array($_SESSION['user'])) {
    header('Location: ../User/Login.php');
    exit();
} else {
    echo "Bienvenido al Dashboard, " . $_SESSION['user']['full_name'] . "!";
}
include 'Views/DashboardView.php';
?>