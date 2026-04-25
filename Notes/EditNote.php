<?php

include_once '../includes/Remember.php';
include_once '../Models/NoteModel.php';


$errors = [];

$database = new Database();
try {
    $conn = $database->connect();
} catch (Exception $e) {
    die('Error en la conexión a la base de datos');
}

$note = new Note($conn);
$noteData = $note->getNoteById($_GET['note_id'] ?? 0, $_SESSION['user']['id']);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $title = $_POST['title'];
    $content = $_POST['content'];
    $bookId = $_POST['book_id'];

    if (empty($title)) {
        $errors[] = 'El título es obligatorio.';
    }

    if (empty($content)) {
        $errors[] = 'El contenido es obligatorio.';
    }

    if ($bookId <= 0) {
        $errors[] = 'ID del cuaderno no válido.';
    }

    if (empty($errors)) {
        $wordCount = str_word_count(strip_tags($content));
        if ($note->updateNote($_POST['note_id'], $_SESSION['user']['id'], $title, $content, $wordCount)) {
            header("Location: ../Books/Book.php?id=" . urlencode((string)$bookId));
            exit();
        } else {
            $errors[] = 'Error al guardar la nota. Por favor, inténtalo de nuevo.';
        }
    }
}

include 'Views/EditNoteView.php';
?>