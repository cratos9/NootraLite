<?php
require_once '../config/db.php';
require_once '../Models/MessageModel.php';
header('Content-Type: application/json');

$uid = 1;
try {
    $db = new Database();
    $pdo = $db->connect();
    $model = new MessageModel($pdo);
    $model->updateLastSeen($uid);
    echo json_encode(['ok' => true]);
} catch (Exception $e) {
    echo json_encode(['ok' => false]);
}
exit;
