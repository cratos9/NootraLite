<?php

require_once '../includes/Remember.php';
require_once '../includes/lightMode.php';
require_once '../config/encrypt.php';
require_once '../Models/BookModel.php';
require_once '../Models/AttachmentModel.php';
require_once '../includes/attachments.php';

$activePage = 'notebooks';

$userID = $_SESSION['user']['id'] ?? 0;
$IsVerified = (bool) ($_SESSION['user']['is_verified'] ?? false);

$database = new Database();
try {
	$conn = $database->connect();
} catch (Exception $e) {
	die('Error en la conexión a la base de datos');
}

$book = new Book($conn);
$attachmentModel = new AttachmentModel($conn);

$bookId = isset($_GET['book_id']) ? (int) $_GET['book_id'] : (int) ($_POST['book_id'] ?? 0);
$bookData = [];
$message = '';
$messageType = '';

if ($bookId > 0) {
	$bookData = $book->getBookById($bookId, $userID);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['upload_attachment'])) {
	$bookId = (int) ($_POST['book_id'] ?? 0);
	$bookData = $bookId > 0 ? $book->getBookById($bookId, $userID) : [];

	if (!$IsVerified) {
		$message = 'Tu cuenta no está verificada. No puedes agregar archivos adjuntos.';
		$messageType = 'error';
	} elseif (empty($bookData)) {
		$message = 'No se encontró el libro al que quieres agregar el archivo.';
		$messageType = 'error';
	} elseif (!isset($_FILES['attachment'])) {
		$message = 'Selecciona un archivo para subir.';
		$messageType = 'error';
	} else {
		try {
			$attachments = new Attachments();
			list($destination, $fileName) = $attachments->uploadAttachment($_FILES['attachment']);

			$saved = $attachmentModel->saveAttachment(
				$userID,
				$bookId,
				$fileName,
				$_FILES['attachment']['name'],
				$destination,
				$_FILES['attachment']['type'],
				(int) $_FILES['attachment']['size']
			);

			if ($saved) {
				$message = 'Archivo subido correctamente';
				$messageType = 'success';
			} else {
				$message = 'El archivo se subió, pero no se pudo guardar su registro.';
				$messageType = 'error';
				try {
					$attachments->deleteAttachment($fileName, $_FILES['attachment']['type']);
				} catch (Exception $cleanupError) {
				}
			}
		} catch (Exception $e) {
			$message = $e->getMessage();
			$messageType = 'error';
		}
	}
}

include 'Views/NewAttachmentView.php';

if ($message) {
	echo '<script>message.' . $messageType . '(' . json_encode($message) . ');</script>';
}

?>
