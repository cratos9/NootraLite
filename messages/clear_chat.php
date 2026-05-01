<?php
require_once '../config/db.php';
session_start();
$uid     = $_SESSION['user']['id'] ?? 1;
$conv_id = intval($_POST['conv_id'] ?? 0);
$db      = (new Database())->connect();
$check   = $db->prepare("SELECT id FROM conversations WHERE id = ? AND (user1_id = ? OR user2_id = ?)");
$check->execute([$conv_id, $uid, $uid]);
if (!$check->fetch()) { echo json_encode(['ok' => false]); exit; }
$db->prepare("DELETE FROM messages WHERE conversation_id = ?")->execute([$conv_id]);
echo json_encode(['ok' => true]);
