<?php
require_once '../config/db.php';
header('Content-Type: application/json');

$q = trim($_GET['q'] ?? '');
$uid = 1;

if (strlen($q) < 2) {
    echo json_encode(['ok' => true, 'users' => []]);
    exit;
}

try {
    $db = new Database();
    $pdo = $db->connect();
    $stmt = $pdo->prepare(
        "SELECT id, username AS name FROM users WHERE username LIKE ? AND id != ? LIMIT 10"
    );
    $stmt->execute(['%' . $q . '%', $uid]);
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['ok' => true, 'users' => $users]);
} catch (Exception $e) {
    echo json_encode(['ok' => false, 'error' => 'error buscando']);
}
exit;
