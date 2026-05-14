<?php
require_once '../includes/Remember.php';
require_once '../config/encrypt.php';
require_once '../core/IA.php';
require_once '../config/db.php';

$activePage = 'dashboard';
$db = new Database();
$pdo = $db->connect();
include 'Views/DashboardView.php';
?>