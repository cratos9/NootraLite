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
    $response = ['ok' => true, 'unread' => (int)$unread];
    // Typing indicator para la conv activa
    $response['other_typing'] = false;
    if (!empty($_GET['conv_id'])) {
        $conv_id = intval($_GET['conv_id']);
        $tStmt = $pdo->prepare(
            'SELECT user1_id, user2_id, typing_u1_at, typing_u2_at
             FROM conversations WHERE id = ?'
        );
        $tStmt->execute([$conv_id]);
        $tConv = $tStmt->fetch(PDO::FETCH_ASSOC);
        if ($tConv) {
            $otherCol = ((int)$tConv['user1_id'] === $uid)
                ? $tConv['typing_u2_at']
                : $tConv['typing_u1_at'];
            $response['other_typing'] = (bool)($otherCol && strtotime($otherCol) > time() - 3);
        }
    }
    echo json_encode($response);
} catch (Exception $e) {
    echo json_encode(['ok' => false, 'unread' => 0]);
}
exit;
