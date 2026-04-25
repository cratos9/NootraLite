<?php

include_once '../includes/Remember.php';
include_once '../config/encrypt.php';
include_once '../includes/lightMode.php';
include_once '../Models/BookModel.php';
include_once '../Models/NoteModel.php';
include '../includes/sidebar.php';

$database = new Database();
try {
    $conn = $database->connect();
} catch (Exception $e) {
    die('Error en la conexión a la base de datos');
}

$book = new Book($conn);
$note = new Note($conn);

$bookId = isset($_GET['id']) ? (int) $_GET['id'] : (isset($_GET['parent_id']) ? (int) $_GET['parent_id'] : 0);

$bookData = [];
$notes = [];

if ($bookId > 0) {
    $bookData = $book->getBookById($bookId, $_SESSION['user']['id']);
    $notes = $note->getNotes($bookId, $_SESSION['user']['id']);
    $booksChildren = $book->getBooksByParentId($bookId, $_SESSION['user']['id']);
}

include 'Views/BookView.php';
?>