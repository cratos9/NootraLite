<?php
require_once '../config/db.php';
session_start();
$uid    = $_SESSION['user']['id'] ?? 1;
$target = intval($_GET['user_id'] ?? 0);
if (!$target) { echo json_encode(['ok' => false]); exit; }
$db   = (new Database())->connect();
$stmt = $db->prepare("SELECT id, username AS name, last_seen FROM users WHERE id = ?");
$stmt->execute([$target]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$user) { echo json_encode(['ok' => false]); exit; }
$is_online = $user['last_seen'] && strtotime($user['last_seen']) >= time() - 300;
echo json_encode([
    'ok'        => true,
    'name'      => $user['name'],
    'last_seen' => $user['last_seen'],
    'is_online' => $is_online
]);
