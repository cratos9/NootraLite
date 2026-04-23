<?php
require_once '../config/db.php';
require_once '../Models/MessageModel.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['ok' => false]);
    exit;
}

$conv_id = (int)($_POST['conv_id'] ?? 0);
$uid = 1;

if (!$conv_id) {
    echo json_encode(['ok' => false]);
    exit;
}

try {
    $db = new Database();
    $pdo = $db->connect();
    $check = $pdo->prepare('SELECT id FROM conversations WHERE id = ? AND (user1_id = ? OR user2_id = ?)');
    $check->execute([$conv_id, $uid, $uid]);
    if (!$check->fetch()) {
        echo json_encode(['ok' => false]);
        exit;
    }
    $model = new MessageModel($pdo);
    $model->markRead($conv_id, $uid);
    // reset force_unread al abrir la conv
    $r = $pdo->prepare('SELECT user1_id FROM conversations WHERE id = ?');
    $r->execute([$conv_id]);
    $u1 = (int)$r->fetchColumn();
    $col = ($u1 === $uid) ? 'force_unread_u1' : 'force_unread_u2';
    $pdo->prepare("UPDATE conversations SET $col = 0 WHERE id = ?")->execute([$conv_id]);
    echo json_encode(['ok' => true]);
} catch (Exception $e) {
    echo json_encode(['ok' => false]);
}
