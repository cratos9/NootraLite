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

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $color = $_POST['color'] ?? '#7c3aed';
    $note = trim($_POST['note'] ?? '');

    if (empty($note)) {
        $errors[] = 'La nota rápida no puede estar vacía.';
    } elseif (strlen($note) > 150) {
        $errors[] = 'La nota rápida no puede exceder los 150 caracteres.';
    }

    if (empty($errors)) {
        if ($quickNotesModel->Create($_SESSION['user']['id'], $note, $color)) {
            header('Location: index.php');
            exit;
        } else {
            $errors[] = 'Error al guardar la nota rápida. Inténtalo de nuevo.';
        }
    }
}

include 'Views/NewQuickNoteView.php';
?>