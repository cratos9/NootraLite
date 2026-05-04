<?php
require_once '../includes/Remember.php';
require_once '../config/encrypt.php';
require_once '../includes/lightMode.php';
require_once '../core/IA.php';

$activePage = 'dashboard';
include '../includes/sidebar.php';
include 'Views/DashboardView.php';
?>