<?php
require_once '../includes/Remember.php';
require_once '../includes/lightMode.php';
require_once '../Models/SubcriptionsModel.php';

$activePage = 'profile';

$database = new Database();
try {
    $conn = $database->connect();
} catch (Exception $e) {
    die('Error en la conexión a la base de datos');
}

$subscriptionsModel = new SubscriptionsModel($conn);
$subscription = $subscriptionsModel->getSubcription($_SESSION['user']['id']);

include 'Views/SubscriptionsView.php';
?>