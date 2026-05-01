<?php
require_once '../config/db.php';
if (session_status() === PHP_SESSION_NONE) session_start();
$uid   = $_SESSION['user']['id'] ?? 1;
$ev_id = intval($_POST['event_id'] ?? 0);
$done  = intval($_POST['done'] ?? 0);
$db    = (new Database())->connect();
$db->prepare("UPDATE tasks SET is_done = ? WHERE id = ? AND user_id = ?")
   ->execute([$done, $ev_id, $uid]);
echo json_encode(['ok' => true, 'is_done' => $done]);
