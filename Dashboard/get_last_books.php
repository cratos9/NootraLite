<?php

include_once '../config/db.php';
include_once '../config/encrypt.php';
require_once '../Models/BookModel.php';

$database = new Database();
try {
    $conn = $database->connect();
} catch (Exception $e) {
    die('Error en la conexión a la base de datos');
}

$bookModel = new Book($conn);
$lastBooks = $bookModel->getLastAccessedBooksByUserId($_SESSION['user']['id'], 3);

?>