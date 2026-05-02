<?php
session_start();
require_once '../config/db.php';

header('Content-Type: application/json');

$uid = (int)($_SESSION['user']['id'] ?? 0);
if (!$uid) { echo json_encode(['ok' => false]); exit; }

$conv_id = (int)($_GET['conv_id'] ?? 0);
if (!$conv_id) { echo json_encode(['ok' => false]); exit; }

$db  = new Database();
$pdo = $db->connect();

$stmt = $pdo->prepare(
    'SELECT u.last_seen,
        IF(TIMESTAMPDIFF(SECOND, u.last_seen, NOW()) < 45, 1, 0) AS is_online
     FROM conversations c
     JOIN users u ON u.id = IF(c.user1_id = ?, c.user2_id, c.user1_id)
     WHERE c.id = ? AND (c.user1_id = ? OR c.user2_id = ?)'
);
$stmt->execute([$uid, $conv_id, $uid, $uid]);
$row = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$row) { echo json_encode(['ok' => false]); exit; }

echo json_encode([
    'ok'        => true,
    'is_online' => (bool)$row['is_online'],
    'last_seen' => $row['last_seen']
]);
