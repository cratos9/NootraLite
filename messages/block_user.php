<?php
require_once '../config/db.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { echo json_encode(['ok' => false]); exit; }

$uid    = 1;
$tid    = (int)($_POST['target_id'] ?? 0);
$action = $_POST['action'] ?? 'block'; // block | unblock

if (!$tid) { echo json_encode(['ok' => false]); exit; }

try {
    $db = (new Database())->connect();
    if ($action === 'block') {
        $db->prepare('INSERT IGNORE INTO blocked_users (blocker_id, blocked_id) VALUES (?,?)')->execute([$uid, $tid]);
    } else {
        $db->prepare('DELETE FROM blocked_users WHERE blocker_id = ? AND blocked_id = ?')->execute([$uid, $tid]);
    }
    echo json_encode(['ok' => true, 'blocked' => $action === 'block']);
} catch (Exception $e) {
    echo json_encode(['ok' => false]);
}
