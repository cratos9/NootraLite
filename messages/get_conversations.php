<?php
require_once '../config/db.php';
require_once '../Models/MessageModel.php';
header('Content-Type: application/json');
header('Cache-Control: no-store');
$uid = 1;
try {
    $pdo   = (new Database())->connect();
    $convs = (new MessageModel($pdo))->getConversations($uid);
    echo json_encode(['ok' => true, 'conversations' => $convs]);
} catch (Exception $e) {
    echo json_encode(['ok' => false, 'conversations' => []]);
}
exit;
