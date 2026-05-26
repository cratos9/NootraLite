<?php
require_once '../config/db.php';
require_once '../Models/MessageModel.php';
if (session_status() === PHP_SESSION_NONE) session_start();
header('Content-Type: application/json');

$conv_id = (int)($_GET['conv_id'] ?? 0);
if (!$conv_id) {
    echo json_encode(['ok' => false, 'error' => 'falta conv_id']);
    exit;
}

try {
    $db = new Database();
    $pdo = $db->connect();
    $uid = $_SESSION['user']['id'] ?? 1;
    $check = $pdo->prepare('SELECT id FROM conversations WHERE id = ? AND (user1_id = ? OR user2_id = ?)');
    $check->execute([$conv_id, $uid, $uid]);
    if (!$check->fetch()) {
        echo json_encode(['ok' => false, 'error' => 'sin acceso']);
        exit;
    }
    $model = new MessageModel($pdo);
    // marcar como leidos al abrir
    $model->markRead($conv_id, $uid);
    $msgs = $model->getMessages($conv_id, $uid);
    $is_online = $model->getOtherUserStatus($conv_id, $uid);

    $lsStmt = $pdo->prepare(
        'SELECT u.last_seen FROM conversations c
         JOIN users u ON u.id = IF(c.user1_id = ?, c.user2_id, c.user1_id)
         WHERE c.id = ?'
    );
    $lsStmt->execute([$uid, $conv_id]);
    $otherLastSeen = $lsStmt->fetchColumn() ?: null;

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

    $tStmt = $pdo->prepare(
        'SELECT
            IF(user1_id = ?,
                typing_u2_at IS NOT NULL AND typing_u2_at > DATE_SUB(NOW(), INTERVAL 3 SECOND),
                typing_u1_at IS NOT NULL AND typing_u1_at > DATE_SUB(NOW(), INTERVAL 3 SECOND)
            ) AS other_typing,
            IF(user1_id = ?,
                recording_u2_at IS NOT NULL AND recording_u2_at > DATE_SUB(NOW(), INTERVAL 4 SECOND),
                recording_u1_at IS NOT NULL AND recording_u1_at > DATE_SUB(NOW(), INTERVAL 4 SECOND)
            ) AS other_recording
         FROM conversations WHERE id = ?'
    );
    $tStmt->execute([$uid, $uid, $conv_id]);
    $tRow = $tStmt->fetch(PDO::FETCH_ASSOC);

    $clrStmt = $pdo->prepare(
        'SELECT IF(user1_id = ?, cleared_at_u1, cleared_at_u2) FROM conversations WHERE id = ?'
    );
    $clrStmt->execute([$uid, $conv_id]);
    $clearedAt = $clrStmt->fetchColumn() ?: null;

    if ($clearedAt) {
        $delStmt = $pdo->prepare(
            'SELECT COUNT(*) FROM messages WHERE conversation_id = ? AND deleted_for_all = 1 AND created_at > ?'
        );
        $delStmt->execute([$conv_id, $clearedAt]);
    } else {
        $delStmt = $pdo->prepare(
            'SELECT COUNT(*) FROM messages WHERE conversation_id = ? AND deleted_for_all = 1'
        );
        $delStmt->execute([$conv_id]);
    }
    $deletedCount = (int)$delStmt->fetchColumn();

    echo json_encode([
        'ok'                => true,
        'messages'          => $msgs,
        'is_online'         => $is_online,
        'last_seen'         => $otherLastSeen,
        'pinned_message_id' => $pinnedMsgId ? (int)$pinnedMsgId : null,
        'bookmarked_ids'    => $bookmarkedIds,
        'other_typing'      => $tRow ? (bool)$tRow['other_typing']    : false,
        'other_recording'   => $tRow ? (bool)$tRow['other_recording'] : false,
        'deleted_count'     => $deletedCount,
    ]);
} catch (Exception $e) {
    echo json_encode(['ok' => false, 'error' => 'error al obtener mensajes']);
}
exit;
