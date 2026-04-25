<?php

include_once '../includes/Remember.php';
include_once '../Models/NoteModel.php';

$database = new Database();
try {
    $conn = $database->connect();
} catch (Exception $e) {
    die('Error en la conexión a la base de datos');
}

$note = new Note($conn);

$note -> deleteNote($_GET['note_id'] ?? 0, $_SESSION['user']['id']);

if ($note) {
    header("Location: ../Books/Book.php?id=" . urlencode((string)($_GET['book_id'] ?? '')));
    exit();
} else {
    die('Error al eliminar la nota. Por favor, inténtalo de nuevo.');
}

?>