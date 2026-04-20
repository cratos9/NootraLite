<?php

include_once '../includes/Remember.php';
include_once '../config/encrypt.php';
include_once '../includes/lightMode.php';
include_once '../Models/BookModel.php';
include '../includes/sidebar.php';

$database = new Database();
try {
    $conn = $database->connect();
} catch (Exception $e) {
    die('Error en la conexión a la base de datos');
}

$book = new Book($conn);
$bookData = $book->getBookById($_GET['id'], $_SESSION['user']['id']);

include 'Views/BookView.php';
?>