<?php
require_once '../includes/db.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['ok' => false, 'error' => 'método no permitido']);
    exit;
}

$title   = trim($_POST['title'] ?? '');
$date    = trim($_POST['date'] ?? '');
$time    = trim($_POST['time'] ?? '');
$all_day = isset($_POST['all_day']) ? 1 : 0;
$color   = trim($_POST['color'] ?? '#7c3aed');

// validar
if ($title === '') {
    echo json_encode(['ok' => false, 'error' => 'El título es obligatorio']);
    exit;
}
if ($date === '') {
    echo json_encode(['ok' => false, 'error' => 'La fecha es obligatoria']);
    exit;
}

$start_dt = $date . ' ' . ($all_day || $time === '' ? '00:00:00' : $time . ':00');

// insertar
try {
    $stmt = $pdo->prepare(
      "INSERT INTO tasks (user_id, title, start_datetime, all_day, color)
       VALUES (1, ?, ?, ?, ?)"
    );
    $stmt->execute([$title, $start_dt, $all_day, $color]);
    $newId = $pdo->lastInsertId();

    $dt = new DateTime($start_dt);
    echo json_encode([
        'ok' => true,
        'event' => [
            'title' => $title,
            'color' => $color,
            'day'   => (int)$dt->format('j'),
            'month' => (int)$dt->format('n') - 1,
            'year'  => (int)$dt->format('Y'),
            'time'  => $all_day ? 'Todo el día' : $dt->format('H:i'),
        ]
    ]);
} catch (Exception $e) {
    echo json_encode(['ok' => false, 'error' => 'error al guardar']);
}
exit;
