<?php
require_once '../config/db.php';
if (session_status() === PHP_SESSION_NONE) session_start();
header('Content-Type: application/json');

$uid = $_SESSION['user']['id'] ?? 1;

try {
    $db   = new Database();
    $pdo  = $db->connect();
    $stmt = $pdo->prepare(
        "SELECT id, COALESCE(username, name) AS name FROM users
         WHERE id != ?
           AND id NOT IN (SELECT blocked_id FROM blocked_users WHERE blocker_id = ?)
         ORDER BY name ASC"
    );
    $stmt->execute([$uid, $uid]);
    echo json_encode(['ok' => true, 'users' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
} catch (Exception $e) {
    echo json_encode(['ok' => false, 'error' => 'error cargando usuarios']);
}
