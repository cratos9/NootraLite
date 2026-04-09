<?php
require_once '../config/db.php';
require_once '../Models/MessageModel.php';
header('Content-Type: application/json');

$uid = 1;
try {
    $db = new Database();
    $pdo = $db->connect();
    $model = new MessageModel($pdo);
    $unread = $model->getUnreadCount($uid);
    echo json_encode(['ok' => true, 'unread' => (int)$unread]);
} catch (Exception $e) {
    echo json_encode(['ok' => false, 'unread' => 0]);
}
exit;
