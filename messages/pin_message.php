<?php
require_once '../config/db.php';
if (session_status() === PHP_SESSION_NONE) session_start();
header('Content-Type: application/json');

$uid     = $_SESSION['user']['id'] ?? 1;
$conv_id = (int)($_POST['conv_id'] ?? 0);
$action  = $_POST['action'] ?? 'pin';
$msg_id  = (int)($_POST['msg_id'] ?? 0);

if (!$conv_id) { echo json_encode(['ok' => false]); exit; }

try {
    $db  = new Database();
    $pdo = $db->connect();

    $chk = $pdo->prepare('SELECT id FROM conversations WHERE id = ? AND (user1_id = ? OR user2_id = ?)');
    $chk->execute([$conv_id, $uid, $uid]);
    if (!$chk->fetch()) { echo json_encode(['ok' => false, 'error' => 'sin acceso']); exit; }

    if ($action === 'unpin') {
        $pdo->prepare('UPDATE conversations SET pinned_message_id = NULL WHERE id = ?')->execute([$conv_id]);
        echo json_encode(['ok' => true, 'pinned_message_id' => null]);
    } else {
        $mchk = $pdo->prepare('SELECT id FROM messages WHERE id = ? AND conversation_id = ?');
        $mchk->execute([$msg_id, $conv_id]);
        if (!$mchk->fetch()) { echo json_encode(['ok' => false, 'error' => 'mensaje no encontrado']); exit; }
        $pdo->prepare('UPDATE conversations SET pinned_message_id = ? WHERE id = ?')->execute([$msg_id, $conv_id]);
        echo json_encode(['ok' => true, 'pinned_message_id' => $msg_id]);
    }
} catch (Exception $e) {
    echo json_encode(['ok' => false, 'error' => 'error db']);
}
exit;
