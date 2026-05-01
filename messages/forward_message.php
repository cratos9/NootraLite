<?php
require_once '../config/db.php';
header('Content-Type: application/json');

if (session_status() === PHP_SESSION_NONE) session_start();
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['ok' => false]); exit;
}

$uid     = $_SESSION['user']['id'] ?? 1;
$msg_id  = intval($_POST['msg_id']  ?? 0);
$conv_id = intval($_POST['target_conv_id'] ?? 0);
if (!$msg_id || !$conv_id) { echo json_encode(['ok' => false]); exit; }

try {
    $db  = new Database();
    $pdo = $db->connect();

    $orig = $pdo->prepare("SELECT body, attachment_url, attachment_type FROM messages WHERE id = ?");
    $orig->execute([$msg_id]);
    $msg = $orig->fetch(PDO::FETCH_ASSOC);
    if (!$msg) { echo json_encode(['ok' => false]); exit; }

    $check = $pdo->prepare("SELECT id FROM conversations WHERE id = ? AND (user1_id = ? OR user2_id = ?)");
    $check->execute([$conv_id, $uid, $uid]);
    if (!$check->fetch()) { echo json_encode(['ok' => false]); exit; }

    $ins = $pdo->prepare(
        "INSERT INTO messages (conversation_id, sender_id, body, attachment_url, attachment_type)
         VALUES (?,?,?,?,?)"
    );
    $ins->execute([$conv_id, $uid, $msg['body'], $msg['attachment_url'], $msg['attachment_type']]);

    echo json_encode(['ok' => true, 'new_id' => $pdo->lastInsertId()]);
} catch (Exception $e) {
    echo json_encode(['ok' => false]);
}
