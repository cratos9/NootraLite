<?php

include_once '../includes/Remember.php';
include_once '../config/encrypt.php';
include_once '../includes/lightMode.php';
include_once '../Models/UserModel.php';
include_once '../Models/BookModel.php';
include_once '../Models/NoteModel.php';
include_once '../Models/AttachmentModel.php';
include_once '../includes/attachments.php';
$activePage = 'notebooks';
include '../includes/sidebar.php';



$database = new Database();
try {
    $conn = $database->connect();
} catch (Exception $e) {
    die('Error en la conexión a la base de datos');
}

$user = new User($conn);
$book = new Book($conn);
$note = new Note($conn);
$attachment = new AttachmentModel($conn);
$bookId = isset($_GET['id']) ? (int) $_GET['id'] : (isset($_GET['parent_id']) ? (int) $_GET['parent_id'] : 0);

$attachmentMessage = $_GET['attachment_msg'] ?? '';
$attachmentMessageType = $_GET['attachment_type'] ?? '';

$bookData = [];
$notes = [];

if ($bookId > 0) {
    $IsVerified = $_SESSION['user']['is_verified'];
    $bookData = $book->getBookById($bookId, $_SESSION['user']['id']);
    $notes = $note->getNotes($bookId, $_SESSION['user']['id']);
    $booksChildren = $book->getBooksByParentId($bookId, $_SESSION['user']['id']);
    $attachments = $attachment->getAttachmentsByNotebookId($bookId, $_SESSION['user']['id']);
}

include 'Views/BookView.php';

if ($attachmentMessage && in_array($attachmentMessageType, ['success', 'error'], true)) {
    echo '<script>message.' . $attachmentMessageType . '(' . json_encode($attachmentMessage) . ');</script>';
}
?>