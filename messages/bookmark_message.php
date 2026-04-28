<?php
require_once '../config/db.php';
header('Content-Type: application/json');

$uid    = 1;
$msg_id = (int)($_POST['msg_id'] ?? 0);

if (!$msg_id) { echo json_encode(['ok' => false]); exit; }

try {
    $db  = new Database();
    $pdo = $db->connect();

    $chk = $pdo->prepare(
        'SELECT m.id FROM messages m
         JOIN conversations c ON c.id = m.conversation_id
         WHERE m.id = ? AND (c.user1_id = ? OR c.user2_id = ?)'
    );
    $chk->execute([$msg_id, $uid, $uid]);
    if (!$chk->fetch()) { echo json_encode(['ok' => false, 'error' => 'sin acceso']); exit; }

    $exists = $pdo->prepare('SELECT id FROM message_bookmarks WHERE user_id = ? AND message_id = ?');
    $exists->execute([$uid, $msg_id]);

    if ($exists->fetch()) {
        $pdo->prepare('DELETE FROM message_bookmarks WHERE user_id = ? AND message_id = ?')->execute([$uid, $msg_id]);
        echo json_encode(['ok' => true, 'bookmarked' => false]);
    } else {
        $pdo->prepare('INSERT IGNORE INTO message_bookmarks (user_id, message_id) VALUES (?, ?)')->execute([$uid, $msg_id]);
        echo json_encode(['ok' => true, 'bookmarked' => true]);
    }
} catch (Exception $e) {
    echo json_encode(['ok' => false, 'error' => 'error db']);
}
exit;
