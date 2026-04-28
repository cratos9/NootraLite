<?php

header('Content-Type: application/json; charset=UTF-8');

include_once '../includes/Remember.php';
require_once '../core/IA.php';
require_once '../config/db.php';
require_once '../config/encrypt.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'ok' => false,
        'message' => 'Metodo no permitido.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$prompt = trim($_POST['prompt'] ?? '');
$rawPrompt = trim($_POST['raw_prompt'] ?? '');
$mode = trim($_POST['mode'] ?? 'general');
$conversationId = trim($_POST['conversation_id'] ?? '');
$bookIdRaw = trim((string) ($_POST['book_id'] ?? ''));

$bookId = ctype_digit($bookIdRaw) && (int) $bookIdRaw > 0 ? (int) $bookIdRaw : null;

if ($prompt === '') {
    http_response_code(422);
    echo json_encode([
        'ok' => false,
        'message' => 'La pregunta es obligatoria.'
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

if ($rawPrompt === '') {
    $rawPrompt = $prompt;
}

if ($conversationId === '') {
    $conversationId = bin2hex(random_bytes(10));
}

try {
    $database = new Database();
    $conn = $database->connect();

    $memoryMessages = [];
    if ($conversationId !== '') {
        $memorySql = 'SELECT query_text, response_text FROM ia_queries WHERE user_id = ? AND conversation_id = ?';
        $memoryParams = [$_SESSION['user']['id'], $conversationId];

        if ($bookId !== null) {
            $memorySql .= ' AND notebook_id = ?';
            $memoryParams[] = $bookId;
        } else {
            $memorySql .= ' AND notebook_id IS NULL';
        }

        $memorySql .= ' ORDER BY order_in_conversation DESC, created_at DESC LIMIT 5';
        $memoryStmt = $conn->prepare($memorySql);
        $memoryStmt->execute($memoryParams);
        $memoryRows = $memoryStmt->fetchAll(PDO::FETCH_ASSOC);

        $messagesDesc = [];
        foreach ($memoryRows as $row) {
            $responseText = trim((string) decrypt_data((string) ($row['response_text'] ?? '')));
            $queryText = trim((string) decrypt_data((string) ($row['query_text'] ?? '')));

            if ($responseText !== '') {
                $messagesDesc[] = [
                    'role' => 'assistant',
                    'content' => $responseText
                ];
            }

            if ($queryText !== '') {
                $messagesDesc[] = [
                    'role' => 'user',
                    'content' => $queryText
                ];
            }
        }

        if (!empty($messagesDesc)) {
            $memoryMessages = array_reverse(array_slice($messagesDesc, 0, 5));
        }
    }

    $startedAt = microtime(true);
    $ia = new IA();
    $iaResult = $ia->Ask($prompt, $memoryMessages);
    $response = is_array($iaResult) ? (string) ($iaResult['text'] ?? '') : (string) $iaResult;
    $tokensUsed = null;
    if (is_array($iaResult) && isset($iaResult['tokens_used']) && is_numeric($iaResult['tokens_used'])) {
        $tokensUsed = (int) $iaResult['tokens_used'];
    }

    if ($response === '') {
        $response = 'No se pudo obtener una respuesta de la IA.';
    }

    $responseTimeMs = (int) round((microtime(true) - $startedAt) * 1000);

    $nextOrderSql = 'SELECT COALESCE(MAX(order_in_conversation), 0) + 1 AS next_order FROM ia_queries WHERE user_id = ? AND conversation_id = ?';
    $nextOrderParams = [$_SESSION['user']['id'], $conversationId];

    if ($bookId !== null) {
        $nextOrderSql .= ' AND notebook_id = ?';
        $nextOrderParams[] = $bookId;
    } else {
        $nextOrderSql .= ' AND notebook_id IS NULL';
    }

    $nextOrderStmt = $conn->prepare($nextOrderSql);
    $nextOrderStmt->execute($nextOrderParams);
    $nextOrder = (int) ($nextOrderStmt->fetch(PDO::FETCH_ASSOC)['next_order'] ?? 1);

    $insertSql = 'INSERT INTO ia_queries (user_id, notebook_id, conversation_id, order_in_conversation, query_text, response_text, query_type, subject, language, tokens_used, response_time_ms) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    $insertStmt = $conn->prepare($insertSql);
    $insertStmt->execute([
        $_SESSION['user']['id'],
        $bookId,
        $conversationId,
        $nextOrder,
        encrypt_data($rawPrompt),
        encrypt_data($response),
        $mode,
        encrypt_data('general'),
        'es',
        $tokensUsed,
        $responseTimeMs
    ]);

    echo json_encode([
        'ok' => true,
        'response' => $response,
        'conversation_id' => $conversationId,
        'order' => $nextOrder,
        'tokens_used' => $tokensUsed,
        'response_time_ms' => $responseTimeMs,
        'rating' => null,
        'is_helpful' => null
    ], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'message' => 'Error interno al procesar la consulta.'
    ], JSON_UNESCAPED_UNICODE);
}
