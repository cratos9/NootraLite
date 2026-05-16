<?php
require_once '../config/db.php';

if (session_status() === PHP_SESSION_NONE) session_start();
header('Content-Type: application/json');

$uid = (int)($_SESSION['user']['id'] ?? 0);
if (!$uid) { echo json_encode(['ok' => false, 'event_days' => []]); exit; }

$month = max(1, min(12, (int)($_GET['month'] ?? $_GET['m'] ?? date('n'))));
$year  = max(2000, min(2100, (int)($_GET['year']  ?? $_GET['y'] ?? date('Y'))));

$start = sprintf('%04d-%02d-01', $year, $month);
$end   = date('Y-m-t', strtotime($start));

$database = new Database();
$pdo = $database->connect();

$stmt = $pdo->prepare(
    "SELECT DISTINCT DAY(start_datetime) AS d
     FROM tasks
     WHERE user_id = ? AND DATE(start_datetime) BETWEEN ? AND ? AND is_done = 0"
);
$stmt->execute([$uid, $start, $end]);
$days = array_map('intval', array_column($stmt->fetchAll(PDO::FETCH_ASSOC), 'd'));

echo json_encode(['ok' => true, 'event_days' => array_values($days)]);
