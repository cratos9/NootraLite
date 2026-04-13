<?php
require_once '../config/db.php';
require_once '../Models/MessageModel.php';
header('Content-Type: application/json');

$conv_id = (int)($_GET['conv_id'] ?? 0);
if (!$conv_id) {
    echo json_encode(['ok' => false, 'error' => 'falta conv_id']);
    exit;
}

try {
    $db = new Database();
    $pdo = $db->connect();
    $model = new MessageModel($pdo);
    // marcar como leidos al abrir
    $model->markRead($conv_id, 1);
    $msgs = $model->getMessages($conv_id);
    $is_online = $model->getOtherUserStatus($conv_id, 1);
    echo json_encode(['ok' => true, 'messages' => $msgs, 'is_online' => $is_online]);
} catch (Exception $e) {
    echo json_encode(['ok' => false, 'error' => 'error al obtener mensajes']);
}
exit;
