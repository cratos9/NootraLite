<?php
require_once '../config/db.php';
require_once '../Models/EventModel.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['ok' => false, 'error' => 'método no permitido']);
    exit;
}

$id      = intval($_POST['id'] ?? 0);
$title   = trim($_POST['title'] ?? '');
$date    = trim($_POST['date'] ?? '');
$time    = trim($_POST['time'] ?? '');
$all_day = isset($_POST['all_day']) ? 1 : 0;
$color   = trim($_POST['color'] ?? '#7c3aed');

if (!$id || $title === '' || $date === '') {
    echo json_encode(['ok' => false, 'error' => 'datos incompletos']);
    exit;
}

$start_dt = $date . ' ' . ($all_day || $time === '' ? '00:00:00' : $time . ':00');

try {
    $database = new Database();
    $pdo = $database->connect();
    $model = new EventModel($pdo);

    $ok = $model->update($id, 1, $title, $start_dt, $all_day, $color);

    if (!$ok) {
        echo json_encode(['ok' => false, 'error' => 'no se pudo actualizar']);
        exit;
    }

    $dt = new DateTime($start_dt);
    echo json_encode([
        'ok' => true,
        'event' => [
            'id'    => $id,
            'title' => $title,
            'color' => $color,
            'day'   => (int)$dt->format('j'),
            'month' => (int)$dt->format('n') - 1,
            'year'  => (int)$dt->format('Y'),
            'time'  => $all_day ? 'Todo el día' : $dt->format('H:i'),
            'start_datetime' => $start_dt,
            'all_day' => (bool)$all_day,
            'is_done' => false,
        ]
    ]);
} catch (Exception $e) {
    echo json_encode(['ok' => false, 'error' => 'error interno']);
}
exit;
