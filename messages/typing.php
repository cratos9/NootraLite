<?php
require_once '../config/db.php';
header('Content-Type: application/json');

if (session_status() === PHP_SESSION_NONE) session_start();
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['ok' => false]);
    exit;
}

$uid     = $_SESSION['user']['id'] ?? 1;
$conv_id = (int)($_POST['conv_id'] ?? 0);

if (!$conv_id) {
    echo json_encode(['ok' => false]);
    exit;
}

try {
    $db  = new Database();
    $pdo = $db->connect();

    $stmt = $pdo->prepare('SELECT user1_id, user2_id FROM conversations WHERE id = ?');
    $stmt->execute([$conv_id]);
    $conv = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$conv || !in_array($uid, [(int)$conv['user1_id'], (int)$conv['user2_id']])) {
        echo json_encode(['ok' => false]);
        exit;
    }

    $col = ((int)$conv['user1_id'] === $uid) ? 'typing_u1_at' : 'typing_u2_at';
    $pdo->prepare("UPDATE conversations SET $col = NOW() WHERE id = ?")->execute([$conv_id]);
    echo json_encode(['ok' => true]);
} catch (Exception $e) {
    echo json_encode(['ok' => false]);
}
