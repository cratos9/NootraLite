<?php
require_once '../config/db.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { echo json_encode(['ok' => false]); exit; }

$conv_id = (int)($_POST['conv_id'] ?? 0);
$uid     = 1;

if (!$conv_id) { echo json_encode(['ok' => false]); exit; }

try {
    $db   = (new Database())->connect();
    $stmt = $db->prepare('DELETE FROM conversations WHERE id = ? AND (user1_id = ? OR user2_id = ?)');
    $stmt->execute([$conv_id, $uid, $uid]);
    echo json_encode(['ok' => $stmt->rowCount() > 0]);
} catch (Exception $e) {
    echo json_encode(['ok' => false]);
}
