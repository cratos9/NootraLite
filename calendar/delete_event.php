<?php
require_once '../config/db.php';
require_once '../Models/EventModel.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['ok' => false, 'error' => 'metodo no permitido']);
    exit;
}

$id = (int)($_POST['id'] ?? 0);

if ($id <= 0) {
  echo json_encode(['ok' => false, 'error' => 'id invalido']);
  exit;
}

if (session_status() === PHP_SESSION_NONE) session_start();
$uid = $_SESSION['user']['id'] ?? 1;

try {
    $database = new Database();
    $pdo = $database->connect();
    $model = new EventModel($pdo);

    $model->delete($id, $uid);
    echo json_encode(['ok' => true]);
} catch (Exception $e) {
    echo json_encode(['ok' => false, 'error' => 'error al eliminar']);
}
exit;
