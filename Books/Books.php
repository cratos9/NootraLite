<?php
include_once '../includes/Remember.php';
include_once '../config/encrypt.php';
include_once '../includes/lightMode.php';
include_once '../Models/BookModel.php';
$activePage = 'notebooks';

$database = new Database();
try {
    $conn = $database->connect();
} catch (Exception $e) {
    die('Error en la conexión a la base de datos');
}

$book = new Book($conn);
$books = $book->getBooks($_SESSION['user']['id']);

$attachmentMessage = $_GET['attachment_msg'] ?? '';
$attachmentMessageType = $_GET['attachment_type'] ?? '';

include 'Views/BooksView.php';

if ($attachmentMessage && in_array($attachmentMessageType, ['success', 'error'], true)) {
    echo '<script>message.' . $attachmentMessageType . '(' . json_encode($attachmentMessage) . ');</script>';
}
?>