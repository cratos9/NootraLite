<?php

include_once '../includes/Remember.php';
include_once '../config/encrypt.php';
include_once '../includes/lightMode.php';
include_once '../Models/NoteModel.php';

$activePage = 'notebooks';

$errors = [];

$database = new Database();
try {
    $conn = $database->connect();
} catch (Exception $e) {
    die('Error en la conexión a la base de datos');
}

$note = new Note($conn);

$noteId = $_GET['note_id'] ?? null;
if (!$noteId || !is_numeric($noteId)) {
    die('ID de nota no válido.');
}
$noteData = $note->getNoteById($noteId, $_SESSION['user']['id']);
if (!$noteData) {
    die('Nota no encontrada o no tienes permiso para verla.');
}

include 'Views/NoteView.php';
?>