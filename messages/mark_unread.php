<?php
require_once '../config/db.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { echo json_encode(['ok' => false]); exit; }

$conv_id = (int)($_POST['conv_id'] ?? 0);
$action  = $_POST['action'] ?? 'mark'; // mark | reset
$uid     = 1;

if (!$conv_id) { echo json_encode(['ok' => false]); exit; }

try {
    $db   = (new Database())->connect();
    $stmt = $db->prepare('SELECT user1_id, user2_id FROM conversations WHERE id = ? AND (user1_id = ? OR user2_id = ?)');
    $stmt->execute([$conv_id, $uid, $uid]);
    $conv = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$conv) { echo json_encode(['ok' => false]); exit; }

    $col = ($conv['user1_id'] == $uid) ? 'force_unread_u1' : 'force_unread_u2';
    $val = ($action === 'reset') ? 0 : 1;
    $db->prepare("UPDATE conversations SET $col = ? WHERE id = ?")->execute([$val, $conv_id]);
    echo json_encode(['ok' => true, 'force_unread' => $val]);
} catch (Exception $e) {
    echo json_encode(['ok' => false]);
}
