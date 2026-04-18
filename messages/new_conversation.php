<?php
require_once '../config/db.php';
require_once '../Models/MessageModel.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['ok' => false, 'error' => 'método no permitido']);
    exit;
}

$other_id = (int)($_POST['user_id'] ?? 0);
$uid = 1;

if (!$other_id || $other_id === $uid) {
    echo json_encode(['ok' => false, 'error' => 'usuario inválido']);
    exit;
}

try {
    $db = new Database();
    $pdo = $db->connect();
    $model = new MessageModel($pdo);
    $conv_id = $model->createConversation($uid, $other_id);

    // datos del otro usuario
    $stmt = $pdo->prepare('SELECT id, username, IF(TIMESTAMPDIFF(SECOND, last_seen, NOW()) < 120, 1, 0) AS is_online FROM users WHERE id = ?');
    $stmt->execute([$other_id]);
    $other = $stmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        'ok' => true,
        'conversation' => [
            'id' => (int)$conv_id,
            'user1_id' => min($uid, $other_id),
            'user2_id' => max($uid, $other_id),
            'last_msg' => null,
            'last_time' => null,
            'other_name' => $other['username'],
            'is_online' => (int)$other['is_online'],
            'unread' => 0,
        ]
    ]);
} catch (Exception $e) {
    echo json_encode(['ok' => false, 'error' => 'error al crear conversación']);
}
exit;
