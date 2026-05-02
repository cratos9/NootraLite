<?php
require_once '../config/db.php';
if (session_status() === PHP_SESSION_NONE) session_start();
header('Content-Type: application/json');

$uid = $_SESSION['user']['id'] ?? 1;

try {
    $db   = new Database();
    $pdo  = $db->connect();
    $stmt = $pdo->prepare(
        'SELECT mb.message_id, mb.created_at AS bm_date,
                m.body, m.attachment_type, m.conversation_id, m.sender_id,
                COALESCE(u.username, u.name) AS sender_name
         FROM message_bookmarks mb
         JOIN messages m ON m.id = mb.message_id
         JOIN conversations c ON c.id = m.conversation_id
         JOIN users u ON u.id = m.sender_id
         WHERE mb.user_id = ? AND (c.user1_id = ? OR c.user2_id = ?)
         ORDER BY mb.created_at DESC'
    );
    $stmt->execute([$uid, $uid, $uid]);
    echo json_encode(['ok' => true, 'bookmarks' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
} catch (Exception $e) {
    echo json_encode(['ok' => false, 'error' => 'error db']);
}
exit;
