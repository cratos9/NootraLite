<?php

header('Content-Type: application/json; charset=UTF-8');

include_once '../includes/Remember.php';
require_once '../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'ok' => false,
        'message' => 'Metodo no permitido.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if (!isset($_SESSION['user']['id'])) {
    http_response_code(401);
    echo json_encode([
        'ok' => false,
        'message' => 'Sesion no valida.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$conversationId = trim($_POST['conversation_id'] ?? '');
if ($conversationId === '') {
    http_response_code(422);
    echo json_encode([
        'ok' => false,
        'message' => 'conversation_id es obligatorio.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$bookIdRaw = trim((string) ($_POST['book_id'] ?? ''));
$bookId = ctype_digit($bookIdRaw) && (int) $bookIdRaw > 0 ? (int) $bookIdRaw : null;

try {
    $database = new Database();
    $conn = $database->connect();

    $sql = 'DELETE FROM ia_queries WHERE user_id = ? AND conversation_id = ?';
    $params = [$_SESSION['user']['id'], $conversationId];

    if ($bookId !== null) {
        $sql .= ' AND notebook_id = ?';
        $params[] = $bookId;
    } else {
        $sql .= ' AND notebook_id IS NULL';
    }

    $stmt = $conn->prepare($sql);
    $stmt->execute($params);

    echo json_encode([
        'ok' => true,
        'deleted' => $stmt->rowCount() > 0
    ], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'message' => 'No se pudo eliminar la conversacion.'
    ], JSON_UNESCAPED_UNICODE);
}
