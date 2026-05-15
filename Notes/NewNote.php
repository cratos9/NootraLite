<?php

include_once '../includes/Remember.php';
include_once '../Models/BookModel.php';
include_once '../Models/NoteModel.php';
include_once '../Models/SubcriptionsModel.php';


$errors = [];

$database = new Database();
try {
    $conn = $database->connect();
} catch (Exception $e) {
    die('Error en la conexión a la base de datos');
}

$note = new Note($conn);
$book = new Book($conn);
$subscriptions = new SubscriptionsModel($conn);
$subscription = $subscriptions->getSubcription($_SESSION['user']['id']);

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
        $bookData = $book->getBookById((int)$bookId, $_SESSION['user']['id']);
        if (!$bookData) {
            $errors[] = 'No se encontró el cuaderno o no tienes permiso para usarlo.';
        }
    }

    if (empty($errors) && $subscription) {
        $currentNotes = $subscriptions->countNotesByNotebook($_SESSION['user']['id'], (int)$bookId);
        $maxNotes = (int)($subscription['max_notes_per_notebook'] ?? 0);

        if ($currentNotes >= $maxNotes) {
            $errors[] = 'Has alcanzado el límite de notas permitido para este cuaderno.';
        }
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