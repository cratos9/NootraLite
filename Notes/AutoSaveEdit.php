<?php

include_once '../includes/Remember.php';
include_once '../Models/NoteModel.php';

header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Metodo no permitido']);
    exit();
}

$noteId = (int)($_POST['note_id'] ?? 0);
$title = trim((string)($_POST['title'] ?? ''));
$content = (string)($_POST['content'] ?? '');

if ($noteId <= 0 || $title === '' || $content === '') {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'Datos incompletos']);
    exit();
}

$database = new Database();
try {
    $conn = $database->connect();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error en la conexion']);
    exit();
}

$note = new Note($conn);
$userId = (int)($_SESSION['user']['id'] ?? 0);
$existing = $note->getNoteById($noteId, $userId);

if (!$existing) {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Nota no encontrada']);
    exit();
}

$wordCount = str_word_count(strip_tags($content));
$saved = $note->updateNote($noteId, $userId, $title, $content, $wordCount);

if (!$saved) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'No se pudo autoguardar']);
    exit();
}

echo json_encode(['success' => true]);
exit();

?>