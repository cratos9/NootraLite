<?php

require_once '../includes/Remember.php';
require_once '../config/encrypt.php';
require_once '../Models/AttachmentModel.php';
require_once '../includes/attachments.php';

$userID = $_SESSION['user']['id'] ?? 0;
$attachmentId = isset($_GET['id']) ? (int) $_GET['id'] : 0;
$bookId = isset($_GET['book_id']) ? (int) $_GET['book_id'] : 0;

if ($attachmentId <= 0 || $userID <= 0) {
    header('Location: ../Books/Book.php?id=' . $bookId . '&attachment_msg=' . urlencode('Adjunto inválido') . '&attachment_type=error');
    exit;
}

$database = new Database();
try {
    $conn = $database->connect();
} catch (Exception $e) {
    header('Location: ../Books/Book.php?id=' . $bookId . '&attachment_msg=' . urlencode('Error en la conexión a la base de datos') . '&attachment_type=error');
    exit;
}

$attachmentModel = new AttachmentModel($conn);
$attachment = $attachmentModel->getAttachmentById($attachmentId, $userID);

if (empty($attachment)) {
    header('Location: ../Books/Book.php?id=' . $bookId . '&attachment_msg=' . urlencode('Adjunto no encontrado') . '&attachment_type=error');
    exit;
}

$attachments = new Attachments();
$fileDeleted = false;

try {
    $decryptedPath = isset($attachment['file_path']) ? decrypt_data($attachment['file_path']) : '';
    if (!empty($decryptedPath)) {
        $attachments->deleteAttachmentByPath($decryptedPath);
        $fileDeleted = true;
    }
} catch (Exception $e) {
}

if (!$fileDeleted) {
    try {
        $decryptedFilename = isset($attachment['filename']) ? decrypt_data($attachment['filename']) : '';
        $decryptedType = isset($attachment['file_type']) ? decrypt_data($attachment['file_type']) : '';
        $attachments->deleteAttachment($decryptedFilename, $decryptedType);
    } catch (Exception $e) {
    }
}

$deleted = $attachmentModel->deleteAttachment($attachmentId, $userID);

if ($deleted) {
    header('Location: ../Books/Book.php?id=' . $bookId . '&attachment_msg=' . urlencode('Adjunto eliminado correctamente') . '&attachment_type=success');
    exit;
}

header('Location: ../Books/Book.php?id=' . $bookId . '&attachment_msg=' . urlencode('No se pudo eliminar el adjunto') . '&attachment_type=error');
exit;

?>