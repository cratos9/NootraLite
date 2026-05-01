<?php
require_once '../config/db.php';
require_once '../Models/MessageModel.php';
if (session_status() === PHP_SESSION_NONE) session_start();
header('Content-Type: application/json');

$uid = $_SESSION['user']['id'] ?? 1;
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
