<?php
require_once '../config/db.php';
require_once '../Models/MessageModel.php';
header('Content-Type: application/json');

$conv_id = (int)($_GET['conv_id'] ?? 0);
if (!$conv_id) {
    echo json_encode(['ok' => false, 'error' => 'falta conv_id']);
    exit;
}

try {
    $db = new Database();
    $pdo = $db->connect();
    $uid = 1;
    $check = $pdo->prepare('SELECT id FROM conversations WHERE id = ? AND (user1_id = ? OR user2_id = ?)');
    $check->execute([$conv_id, $uid, $uid]);
    if (!$check->fetch()) {
        echo json_encode(['ok' => false, 'error' => 'sin acceso']);
        exit;
    }
    $model = new MessageModel($pdo);
    // marcar como leidos al abrir
    $model->markRead($conv_id, $uid);
    $msgs = $model->getMessages($conv_id);
    $is_online = $model->getOtherUserStatus($conv_id, $uid);

    $pinStmt = $pdo->prepare('SELECT pinned_message_id FROM conversations WHERE id = ?');
    $pinStmt->execute([$conv_id]);
    $pinnedMsgId = $pinStmt->fetchColumn() ?: null;

    $bmStmt = $pdo->prepare(
        'SELECT mb.message_id FROM message_bookmarks mb
         JOIN messages m ON m.id = mb.message_id
         WHERE mb.user_id = ? AND m.conversation_id = ?'
    );
    $bmStmt->execute([$uid, $conv_id]);
    $bookmarkedIds = array_values(array_map('intval', $bmStmt->fetchAll(PDO::FETCH_COLUMN)));

    echo json_encode([
        'ok'                => true,
        'messages'          => $msgs,
        'is_online'         => $is_online,
        'pinned_message_id' => $pinnedMsgId ? (int)$pinnedMsgId : null,
        'bookmarked_ids'    => $bookmarkedIds
    ]);
} catch (Exception $e) {
    echo json_encode(['ok' => false, 'error' => 'error al obtener mensajes']);
}
exit;
