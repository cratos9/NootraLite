<?php
require_once '../config/db.php';
session_start();
$uid    = $_SESSION['user_id'] ?? 1;
$type   = in_array($_POST['target_type'] ?? '', ['message', 'conversation']) ? $_POST['target_type'] : null;
$tid    = intval($_POST['target_id'] ?? 0);
$reason = trim(substr($_POST['reason'] ?? '', 0, 255));
if (!$type || !$tid) { echo json_encode(['ok' => false]); exit; }
$db = Database::getInstance()->getConnection();
$db->prepare("INSERT INTO reports (reporter_id, target_type, target_id, reason) VALUES (?,?,?,?)")
   ->execute([$uid, $type, $tid, $reason]);
echo json_encode(['ok' => true]);
