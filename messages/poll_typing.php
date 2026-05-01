<?php
session_start();
require_once '../config/db.php';

header('Content-Type: application/json');

$uid = (int)($_SESSION['user']['id'] ?? 0);
if (!$uid) { echo json_encode(['ok' => false]); exit; }

$conv_id = (int)($_GET['conv_id'] ?? 0);
if (!$conv_id) { echo json_encode(['ok' => false]); exit; }

$db  = new Database();
$pdo = $db->getConnection();

$stmt = $pdo->prepare(
    'SELECT IF(user1_id = ?,
        typing_u2_at IS NOT NULL AND typing_u2_at > DATE_SUB(NOW(), INTERVAL 3 SECOND),
        typing_u1_at IS NOT NULL AND typing_u1_at > DATE_SUB(NOW(), INTERVAL 3 SECOND)
     ) AS other_typing
     FROM conversations
     WHERE id = ? AND (user1_id = ? OR user2_id = ?)'
);
$stmt->execute([$uid, $conv_id, $uid, $uid]);
$val = $stmt->fetchColumn();

echo json_encode(['ok' => true, 'other_typing' => (bool)$val]);
