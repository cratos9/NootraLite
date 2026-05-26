<?php
session_start();
require_once '../config/db.php';
header('Content-Type: application/json');

$uid     = (int)($_SESSION['user']['id'] ?? 0);
$conv_id = (int)($_GET['conv_id'] ?? 0);
if (!$uid || !$conv_id) { echo json_encode(['ok' => false]); exit; }

try {
    $pdo = (new Database())->connect();

    $stmt = $pdo->prepare(
        'SELECT c.user1_id,
                IF(c.user1_id = ?,
                    c.typing_u2_at IS NOT NULL AND c.typing_u2_at > DATE_SUB(NOW(), INTERVAL 3 SECOND),
                    c.typing_u1_at IS NOT NULL AND c.typing_u1_at > DATE_SUB(NOW(), INTERVAL 3 SECOND)
                ) AS typing,
                IF(c.user1_id = ?,
                    c.recording_u2_at IS NOT NULL AND c.recording_u2_at > DATE_SUB(NOW(), INTERVAL 4 SECOND),
                    c.recording_u1_at IS NOT NULL AND c.recording_u1_at > DATE_SUB(NOW(), INTERVAL 4 SECOND)
                ) AS recording,
                IF(c.user1_id = ?, c.cleared_at_u1, c.cleared_at_u2) AS cleared_at,
                IF(TIMESTAMPDIFF(SECOND, u.last_seen, NOW()) < 45, 1, 0) AS online,
                u.last_seen
         FROM conversations c
         JOIN users u ON u.id = IF(c.user1_id = ?, c.user2_id, c.user1_id)
         WHERE c.id = ? AND (c.user1_id = ? OR c.user2_id = ?)'
    );
    $stmt->execute([$uid, $uid, $uid, $uid, $conv_id, $uid, $uid]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$row) { echo json_encode(['ok' => false]); exit; }

    $clearedAt = $row['cleared_at'] ?: null;

    if ($clearedAt) {
        $mStmt = $pdo->prepare(
            'SELECT MAX(id) AS last_id, SUM(deleted_for_all) AS deleted_count
             FROM messages WHERE conversation_id = ? AND created_at > ?'
        );
        $mStmt->execute([$conv_id, $clearedAt]);
    } else {
        $mStmt = $pdo->prepare(
            'SELECT MAX(id) AS last_id, SUM(deleted_for_all) AS deleted_count
             FROM messages WHERE conversation_id = ?'
        );
        $mStmt->execute([$conv_id]);
    }
    $mRow = $mStmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        'ok'            => true,
        'last_id'       => $mRow['last_id'] ? (int)$mRow['last_id'] : 0,
        'deleted_count' => (int)($mRow['deleted_count'] ?? 0),
        'typing'        => (bool)$row['typing'],
        'recording'     => (bool)$row['recording'],
        'online'        => (bool)$row['online'],
        'last_seen'     => $row['last_seen'],
    ]);
} catch (Exception $e) {
    echo json_encode(['ok' => false]);
}
