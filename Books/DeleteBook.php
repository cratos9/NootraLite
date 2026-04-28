<?php

include_once '../includes/Remember.php';
include_once '../Models/BookModel.php';

$bookId = (int) ($_GET['id'] ?? 0);

if ($bookId <= 0) {
    header('Location: ../Books/Books.php?attachment_msg=' . urlencode('Libro inválido') . '&attachment_type=error');
    exit;
}

$database = new Database();
try {
    $conn = $database->connect();
} catch (Exception $e) {
    header('Location: ../Books/Books.php?attachment_msg=' . urlencode('Error en la conexión a la base de datos') . '&attachment_type=error');
    exit;
}

$book = new Book($conn);
$deleted = $book->deleteBook($bookId, $_SESSION['user']['id']);

if ($deleted) {
    header('Location: ../Books/Books.php?attachment_msg=' . urlencode('Libro eliminado correctamente') . '&attachment_type=success');
    exit;
}

header('Location: ../Books/Books.php?attachment_msg=' . urlencode('No se pudo eliminar el libro') . '&attachment_type=error');
exit;

?>