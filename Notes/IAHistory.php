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

$bookIdRaw = trim((string) ($_GET['book_id'] ?? ''));
$bookId = ctype_digit($bookIdRaw) && (int) $bookIdRaw > 0 ? (int) $bookIdRaw : null;

try {
    $database = new Database();
    $conn = $database->connect();

    $sql = 'SELECT conversation_id, order_in_conversation, query_text, created_at FROM ia_queries WHERE user_id = ? AND conversation_id IS NOT NULL AND conversation_id <> ""';
    $params = [$_SESSION['user']['id']];

    if ($bookId !== null) {
        $sql .= ' AND notebook_id = ?';
        $params[] = $bookId;
    } else {
        $sql .= ' AND notebook_id IS NULL';
    }

    $sql .= ' ORDER BY created_at DESC';
    $stmt = $conn->prepare($sql);
    $stmt->execute($params);

    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $map = [];

    foreach ($rows as $row) {
        $conversationId = (string) ($row['conversation_id'] ?? '');
        if ($conversationId === '') {
            continue;
        }

        $order = (int) ($row['order_in_conversation'] ?? 0);
        $queryText = trim((string) decrypt_data((string) ($row['query_text'] ?? '')));
        $createdAt = (string) ($row['created_at'] ?? '');

        if (!isset($map[$conversationId])) {
            $map[$conversationId] = [
                'conversation_id' => $conversationId,
                'title' => $queryText !== '' ? $queryText : 'Conversacion sin titulo',
                'first_order' => $order > 0 ? $order : PHP_INT_MAX,
                'last_at' => $createdAt,
                'messages_count' => 0
            ];
        }

        $map[$conversationId]['messages_count']++;

        if ($createdAt > $map[$conversationId]['last_at']) {
            $map[$conversationId]['last_at'] = $createdAt;
        }

        if ($order > 0 && $order < $map[$conversationId]['first_order']) {
            $map[$conversationId]['first_order'] = $order;
            $map[$conversationId]['title'] = $queryText !== '' ? $queryText : 'Conversacion sin titulo';
        }
    }

    $conversations = array_values($map);
    usort($conversations, static function ($a, $b) {
        return strcmp((string) $b['last_at'], (string) $a['last_at']);
    });

    $result = array_map(static function ($conversation) {
        return [
            'conversation_id' => $conversation['conversation_id'],
            'title' => $conversation['title'],
            'messages_count' => $conversation['messages_count'],
            'last_at' => $conversation['last_at']
        ];
    }, $conversations);

    echo json_encode([
        'ok' => true,
        'conversations' => $result
    ], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'message' => 'No se pudo cargar el historial.'
    ], JSON_UNESCAPED_UNICODE);
}
