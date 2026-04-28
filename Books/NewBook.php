<?php
include_once '../includes/Remember.php';
include_once '../includes/lightMode.php';
include_once '../Models/BookModel.php';
$activePage = 'notebooks';
include '../includes/sidebar.php';

$errors = [];
$parentId = null;
$parentBookData = null;

$database = new Database();
try {
    $conn = $database->connect();
} catch (Exception $e) {
    die('Error en la conexión a la base de datos');
}

$parentIdInput = $_GET['parent_id'] ?? ($_POST['parent_id'] ?? null);
if ($parentIdInput !== null && $parentIdInput !== '') {
    $parentId = (int)$parentIdInput;
    if ($parentId <= 0) {
        die('ID de libro padre no válido');
    }

    $parentBook = new Book($conn);
    $parentBookData = $parentBook->getBookById($parentId, $_SESSION['user']['id']);
    if (!$parentBookData || $parentBookData['user_id'] !== $_SESSION['user']['id']) {
        die('Libro padre no encontrado o no autorizado');
    }
}

$book = new Book($conn);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $title = trim($_POST['title']);
    $color = $_POST['color'];
    $category = trim($_POST['category']);
    $semester = trim($_POST['semester']);
    $description = trim($_POST['description']);
    $tags = trim($_POST['tags']);

    if (empty($title)) {
        $errors[] = "El título es obligatorio.";
    }

    if (strlen($title) > 120) {
        $errors[] = "El título no puede exceder los 120 caracteres.";
    }

    if (empty($color)) {
        $errors[] = "El color es obligatorio.";
    }

    if (empty($category)) {
        $errors[] = "La categoría es obligatoria.";
    }

    if (strlen($category) > 120) {
        $errors[] = "La categoría no puede exceder los 120 caracteres.";
    }

    if (strlen($description) > 1000) {
        $errors[] = "La descripción no puede exceder los 1000 caracteres.";
    }

    if (empty($description)) {
        $description = "Sin descripción";
    }

    if ($parentBookData) {
        $newBook = $book->addBookChildren($_SESSION['user']['id'], $parentId, $title, $description, $color, $category, $semester, $tags);
        if ($newBook) {
            header('Location: Book.php?id=' . urlencode($parentId));
            exit();
        } else {
            $errors[] = "Error al agregar el libro. Por favor, inténtalo de nuevo.";
        }
    } else {
        $newBook = $book->addBook($_SESSION['user']['id'], $title, $description, $color, $category, $semester, $tags);
        if ($newBook) {
            header('Location: Books.php');
            exit();
        } else {
            $errors[] = "Error al agregar el libro. Por favor, inténtalo de nuevo.";
        }
    }
}

include 'Views/NewBookView.php';
if (!empty($errors)) {
    foreach ($errors as $error) {
        echo '
        <script>
        message.error("' . $error . '");
        </script>
        ';
    }
}
?>