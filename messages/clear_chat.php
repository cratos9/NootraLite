<?php
require_once '../config/db.php';
session_start();
$uid     = $_SESSION['user']['id'] ?? 1;
$conv_id = intval($_POST['conv_id'] ?? 0);
$db      = (new Database())->connect();

$check = $db->prepare("SELECT user1_id, user2_id FROM conversations WHERE id = ? AND (user1_id = ? OR user2_id = ?)");
$check->execute([$conv_id, $uid, $uid]);
$row = $check->fetch(PDO::FETCH_ASSOC);
if (!$row) { echo json_encode(['ok' => false]); exit; }

$col = ($row['user1_id'] == $uid) ? 'cleared_at_u1' : 'cleared_at_u2';
$db->prepare("UPDATE conversations SET $col = NOW() WHERE id = ?")->execute([$conv_id]);
echo json_encode(['ok' => true]);
