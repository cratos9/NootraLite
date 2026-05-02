<?php
session_start();
require_once '../config/db.php';

header('Content-Type: application/json');

$uid = (int)($_SESSION['user']['id'] ?? 0);
if (!$uid) { echo json_encode(['ok' => false]); exit; }

$db  = new Database();
$pdo = $db->connect();

$stmt = $pdo->prepare(
    'SELECT id FROM conversations
     WHERE (user1_id = ? OR user2_id = ?)
       AND IF(user1_id = ?,
              typing_u2_at IS NOT NULL AND typing_u2_at > DATE_SUB(NOW(), INTERVAL 3 SECOND),
              typing_u1_at IS NOT NULL AND typing_u1_at > DATE_SUB(NOW(), INTERVAL 3 SECOND))'
);
$stmt->execute([$uid, $uid, $uid]);
$ids = $stmt->fetchAll(PDO::FETCH_COLUMN);

echo json_encode(['ok' => true, 'typing' => array_map('intval', $ids)]);
