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

$deleted = $note->deleteNote($_GET['note_id'] ?? 0, $_SESSION['user']['id']);
$bookId = (int) ($_GET['book_id'] ?? 0);

if ($deleted) {
    header('Location: ../Books/Book.php?id=' . $bookId . '&attachment_msg=' . urlencode('Nota eliminada correctamente') . '&attachment_type=success');
    exit;
} else {
    header('Location: ../Books/Book.php?id=' . $bookId . '&attachment_msg=' . urlencode('No se pudo eliminar la nota') . '&attachment_type=error');
    exit;
}

?>