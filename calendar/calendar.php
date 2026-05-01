<?php
require_once '../config/db.php';
require_once '../Models/EventModel.php';

$activePage = 'calendar';
include '../includes/sidebar.php';


if (session_status() === PHP_SESSION_NONE) session_start();
$database = new Database();
$pdo = $database->connect();

$uid = $_SESSION['user']['id'] ?? 1;
$model = new EventModel($pdo);
$rows = $model->getAll($uid);

$events = [];
foreach ($rows as $r) {
    $dt = new DateTime($r['start_datetime']);
    $events[] = [
        'id'    => (int)$r['id'],
        'title' => $r['title'],
        'color' => $r['color'] ?: '#7c3aed',
        'day'   => (int)$dt->format('j'),
        'month' => (int)$dt->format('n') - 1, // 0-indexed igual que JS
        'year'  => (int)$dt->format('Y'),
        'time'  => $r['all_day'] ? 'Todo el día' : $dt->format('H:i'),
        'start_datetime' => $r['start_datetime'],
        'all_day' => (bool)$r['all_day'],
        'is_done' => (bool)$r['is_done'],
    ];
}

$weekDays = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

require_once 'Views/CalendarView.php';
