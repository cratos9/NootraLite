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
    "SELECT DAY(start_datetime) AS d, COALESCE(color, '#7c3aed') AS color
     FROM tasks
     WHERE user_id = ? AND DATE(start_datetime) BETWEEN ? AND ? AND is_done = 0
     ORDER BY start_datetime"
);
$stmt->execute([$uid, $start, $end]);
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

$events_by_day = [];
foreach ($rows as $r) {
    $day = (int)$r['d'];
    if (!isset($events_by_day[$day])) $events_by_day[$day] = [];
    if (count($events_by_day[$day]) < 3) $events_by_day[$day][] = $r['color'];
}
$days = array_keys($events_by_day);

echo json_encode(['ok' => true, 'event_days' => array_values($days), 'events_by_day' => $events_by_day]);
