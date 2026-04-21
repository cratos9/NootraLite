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
        if ($note->addNote($_SESSION['user']['id'], $bookId, $title, $content, $wordCount)) {
            header("Location: ../Books/Book.php?id=" . urlencode((string)$bookId));
            exit();
        } else {
            $errors[] = 'Error al guardar la nota. Por favor, inténtalo de nuevo.';
        }
    }
}

include 'Views/NewNoteView.php';
?>