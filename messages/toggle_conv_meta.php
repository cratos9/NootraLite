<?php
require_once '../config/db.php';
require_once '../Models/MessageModel.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { echo json_encode(['ok'=>false]); exit; }

$conv_id = (int)($_POST['conv_id'] ?? 0);
$meta    = trim($_POST['meta'] ?? '');
$uid     = 1;

if (!$conv_id || !in_array($meta, ['favorite','pinned','muted'])) {
    echo json_encode(['ok'=>false,'error'=>'datos inválidos']); exit;
}

try {
    $pdo = (new Database())->connect();
    $chk = $pdo->prepare('SELECT user1_id, user2_id FROM conversations WHERE id = ?');
    $chk->execute([$conv_id]);
    $row = $chk->fetch();
    if (!$row) { echo json_encode(['ok'=>false,'error'=>'sin acceso']); exit; }

    $suffix = ($row['user1_id'] == $uid) ? 'u1' : 'u2';
    $field  = "is_{$meta}_{$suffix}";

    $val = (new MessageModel($pdo))->toggleMeta($conv_id, $field);
    echo json_encode(['ok'=>true, 'value'=>$val]);
} catch (Exception $e) {
    echo json_encode(['ok'=>false,'error'=>'error']);
}
exit;
