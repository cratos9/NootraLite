<?php
require_once '../config/db.php';
require_once '../Models/MessageModel.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['ok' => false, 'error' => 'método no permitido']);
    exit;
}

$conv_id = (int)($_POST['conv_id'] ?? 0);
$body = trim($_POST['body'] ?? '');
$uid = 1; // fijo hasta que haya sesion

if (!$conv_id || $body === '') {
    echo json_encode(['ok' => false, 'error' => 'datos incompletos']);
    exit;
}

try {
    $db = new Database();
    $pdo = $db->connect();
    $check = $pdo->prepare('SELECT id FROM conversations WHERE id = ? AND (user1_id = ? OR user2_id = ?)');
    $check->execute([$conv_id, $uid, $uid]);
    if (!$check->fetch()) {
        echo json_encode(['ok' => false, 'error' => 'sin acceso']);
        exit;
    }
    $model = new MessageModel($pdo);
    $id = $model->send($conv_id, $uid, $body);
    echo json_encode([
        'ok' => true,
        'message' => [
            'id' => (int)$id,
            'conversation_id' => $conv_id,
            'sender_id' => $uid,
            'body' => $body,
            'attachment_url' => null,
            'attachment_type' => null,
            'is_read' => 0,
            'created_at' => date('Y-m-d H:i:s'),
        ]
    ]);
} catch (Exception $e) {
    echo json_encode(['ok' => false, 'error' => 'error al enviar']);
}
exit;
