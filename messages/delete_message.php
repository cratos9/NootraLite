<?php
require_once '../config/db.php';
session_start();
$uid    = $_SESSION['user']['id'] ?? 1;
$msg_id = intval($_POST['msg_id'] ?? 0);
$scope  = $_POST['scope'] ?? 'me';
if (!$msg_id) { echo json_encode(['ok' => false]); exit; }

$db = (new Database())->connect();

if ($scope === 'me') {
    $m = $db->prepare('SELECT sender_id, deleted_for_all FROM messages WHERE id = ?');
    $m->execute([$msg_id]);
    $row = $m->fetch(PDO::FETCH_ASSOC);
    if (!$row) { echo json_encode(['ok' => false]); exit; }
    if ($row['deleted_for_all'] && $row['sender_id'] != $uid) {
        $db->prepare('UPDATE messages SET deleted_for_all = 0 WHERE id = ?')->execute([$msg_id]);
    } else {
        $col = ($row['sender_id'] == $uid) ? 'deleted_for_sender' : 'deleted_for_receiver';
        $db->prepare("UPDATE messages SET $col = 1 WHERE id = ?")->execute([$msg_id]);
    }
} else {
    $db->prepare('UPDATE messages SET deleted_for_sender = 1, deleted_for_receiver = 1, deleted_for_all = 1 WHERE id = ? AND sender_id = ?')
       ->execute([$msg_id, $uid]);
}
echo json_encode(['ok' => true, 'scope' => $scope]);
