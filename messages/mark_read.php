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
    $model = new MessageModel($pdo);
    $model->markRead($conv_id, $uid);
    echo json_encode(['ok' => true]);
} catch (Exception $e) {
    echo json_encode(['ok' => false]);
}
