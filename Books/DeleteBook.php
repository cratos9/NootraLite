<?php

include_once '../includes/Remember.php';
include_once '../Models/BookModel.php';

$database = new Database();
try {
    $conn = $database->connect();
} catch (Exception $e) {
    die('Error en la conexión a la base de datos');
}

$book = new Book($conn);
$bookData = $book->deleteBook($_GET['id'], $_SESSION['user']['id']);

header('Location: ../Books/Books.php');

?>