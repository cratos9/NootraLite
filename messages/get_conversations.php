<?php
require_once '../config/db.php';
require_once '../Models/MessageModel.php';
header('Content-Type: application/json');
header('Cache-Control: no-store');
if (session_status() === PHP_SESSION_NONE) session_start();
$uid = $_SESSION['user']['id'] ?? 1;
try {
    $pdo   = (new Database())->connect();
    $convs = (new MessageModel($pdo))->getConversations($uid);
    echo json_encode(['ok' => true, 'conversations' => $convs]);
} catch (Exception $e) {
    echo json_encode(['ok' => false, 'conversations' => []]);
}
exit;
