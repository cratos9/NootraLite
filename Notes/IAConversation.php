<?php

header('Content-Type: application/json; charset=UTF-8');

include_once '../includes/Remember.php';
require_once '../config/db.php';
require_once '../config/encrypt.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
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

$conversationId = trim($_GET['conversation_id'] ?? '');
if ($conversationId === '') {
    http_response_code(422);
    echo json_encode([
        'ok' => false,
        'message' => 'conversation_id es obligatorio.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$bookIdRaw = trim((string) ($_GET['book_id'] ?? ''));
$bookId = ctype_digit($bookIdRaw) && (int) $bookIdRaw > 0 ? (int) $bookIdRaw : null;

try {
    $database = new Database();
    $conn = $database->connect();

    $sql = 'SELECT order_in_conversation, query_text, response_text, query_type, tokens_used, response_time_ms, rating, is_helpful, created_at FROM ia_queries WHERE user_id = ? AND conversation_id = ?';
    $params = [$_SESSION['user']['id'], $conversationId];

    if ($bookId !== null) {
        $sql .= ' AND notebook_id = ?';
        $params[] = $bookId;
    } else {
        $sql .= ' AND notebook_id IS NULL';
    }

    $sql .= ' ORDER BY order_in_conversation ASC, created_at ASC';
    $stmt = $conn->prepare($sql);
    $stmt->execute($params);

    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $turns = [];
    foreach ($rows as $row) {
        $turns[] = [
            'order' => (int) ($row['order_in_conversation'] ?? 0),
            'query' => (string) decrypt_data((string) ($row['query_text'] ?? '')),
            'response' => (string) decrypt_data((string) ($row['response_text'] ?? '')),
            'mode' => (string) ($row['query_type'] ?? 'general'),
            'tokens_used' => isset($row['tokens_used']) ? (int) $row['tokens_used'] : null,
            'response_time_ms' => isset($row['response_time_ms']) ? (int) $row['response_time_ms'] : null,
            'rating' => isset($row['rating']) ? (int) $row['rating'] : null,
            'is_helpful' => isset($row['is_helpful']) ? (int) $row['is_helpful'] : null,
            'created_at' => (string) ($row['created_at'] ?? '')
        ];
    }

    echo json_encode([
        'ok' => true,
        'conversation_id' => $conversationId,
        'title' => $turns[0]['query'] ?? 'Conversacion sin titulo',
        'turns' => $turns
    ], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'message' => 'No se pudo cargar la conversacion.'
    ], JSON_UNESCAPED_UNICODE);
}
