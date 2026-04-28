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

$conversationId = trim((string) ($_POST['conversation_id'] ?? ''));
$orderRaw = trim((string) ($_POST['order'] ?? ''));
$bookIdRaw = trim((string) ($_POST['book_id'] ?? ''));
$ratingRaw = trim((string) ($_POST['rating'] ?? ''));
$isHelpfulRaw = trim((string) ($_POST['is_helpful'] ?? ''));

if ($conversationId === '') {
    http_response_code(422);
    echo json_encode([
        'ok' => false,
        'message' => 'conversation_id es obligatorio.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if (!ctype_digit($orderRaw) || (int) $orderRaw <= 0) {
    http_response_code(422);
    echo json_encode([
        'ok' => false,
        'message' => 'order es obligatorio y debe ser valido.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$order = (int) $orderRaw;
$bookId = ctype_digit($bookIdRaw) && (int) $bookIdRaw > 0 ? (int) $bookIdRaw : null;

$rating = null;
if ($ratingRaw !== '') {
    if (!ctype_digit($ratingRaw)) {
        http_response_code(422);
        echo json_encode([
            'ok' => false,
            'message' => 'rating debe estar entre 1 y 5.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $ratingValue = (int) $ratingRaw;
    if ($ratingValue < 1 || $ratingValue > 5) {
        http_response_code(422);
        echo json_encode([
            'ok' => false,
            'message' => 'rating debe estar entre 1 y 5.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
    $rating = $ratingValue;
}

$isHelpful = null;
if ($isHelpfulRaw !== '') {
    if ($isHelpfulRaw === '1' || strcasecmp($isHelpfulRaw, 'true') === 0) {
        $isHelpful = 1;
    } elseif ($isHelpfulRaw === '0' || strcasecmp($isHelpfulRaw, 'false') === 0) {
        $isHelpful = 0;
    } else {
        http_response_code(422);
        echo json_encode([
            'ok' => false,
            'message' => 'is_helpful debe ser 1 o 0.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

try {
    $database = new Database();
    $conn = $database->connect();

    $sql = 'UPDATE ia_queries SET rating = ?, is_helpful = ? WHERE user_id = ? AND conversation_id = ? AND order_in_conversation = ?';
    $params = [$rating, $isHelpful, $_SESSION['user']['id'], $conversationId, $order];

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
        'updated' => $stmt->rowCount() > 0,
        'rating' => $rating,
        'is_helpful' => $isHelpful
    ], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'message' => 'No se pudo calificar la respuesta.'
    ], JSON_UNESCAPED_UNICODE);
}
