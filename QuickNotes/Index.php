<?php

include_once '../includes/Remember.php';
include_once '../config/encrypt.php';
include_once '../includes/lightMode.php';
include_once '../Models/QuickNotesModel.php';

$activePage = 'quick-notes';

$errors = [];

$database = new Database();
try {
    $conn = $database->connect();
} catch (Exception $e) {
    die('Error en la conexión a la base de datos');
}

$quickNotesModel = new QuickNote($conn);

$quickNotes = $quickNotesModel->GetAllByUser($_SESSION['user']['id']);

include 'Views/indexView.php';
?>