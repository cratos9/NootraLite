<?php
if (session_status() === PHP_SESSION_NONE) session_start();
header('Content-Type: application/json');

if (empty($_SESSION['user']['id'])) {
    echo json_encode(['counts' => array_fill(0, 7, 0), 'max' => 1]);
    exit;
}

require_once '../config/db.php';
$uid = (int)$_SESSION['user']['id'];
$db  = new Database();
$pdo = $db->connect();

// Lunes y domingo de la semana actual
// WEEKDAY(): 0=lun 1=mar 2=mié 3=jue 4=vie 5=sáb 6=dom
$lunes   = date('Y-m-d', strtotime('monday this week'));
$domingo = date('Y-m-d', strtotime('sunday this week'));

$counts = array_fill(0, 7, 0);

try {
    $st = $pdo->prepare('
        SELECT WEEKDAY(created_at) AS dow, COUNT(*) AS cnt
        FROM messages
        WHERE sender_id = ?
          AND DATE(created_at) BETWEEN ? AND ?
        GROUP BY WEEKDAY(created_at)
    ');
    $st->execute([$uid, $lunes, $domingo]);
    foreach ($st->fetchAll(PDO::FETCH_ASSOC) as $r) {
        $counts[(int)$r['dow']] += (int)$r['cnt'];
    }
} catch (Exception $e) {}

try {
    $st = $pdo->prepare('
        SELECT WEEKDAY(created_at) AS dow, COUNT(*) AS cnt
        FROM tasks
        WHERE user_id = ?
          AND DATE(created_at) BETWEEN ? AND ?
        GROUP BY WEEKDAY(created_at)
    ');
    $st->execute([$uid, $lunes, $domingo]);
    foreach ($st->fetchAll(PDO::FETCH_ASSOC) as $r) {
        $counts[(int)$r['dow']] += (int)$r['cnt'];
    }
} catch (Exception $e) {}

try {
    $st = $pdo->prepare('
        SELECT WEEKDAY(created_at) AS dow, COUNT(*) AS cnt
        FROM notebooks
        WHERE user_id = ?
          AND DATE(created_at) BETWEEN ? AND ?
        GROUP BY WEEKDAY(created_at)
    ');
    $st->execute([$uid, $lunes, $domingo]);
    foreach ($st->fetchAll(PDO::FETCH_ASSOC) as $r) {
        $counts[(int)$r['dow']] += (int)$r['cnt'];
    }
} catch (Exception $e) {}

try {
    $st = $pdo->prepare('
        SELECT WEEKDAY(created_at) AS dow, COUNT(*) AS cnt
        FROM notes
        WHERE user_id = ?
          AND DATE(created_at) BETWEEN ? AND ?
        GROUP BY WEEKDAY(created_at)
    ');
    $st->execute([$uid, $lunes, $domingo]);
    foreach ($st->fetchAll(PDO::FETCH_ASSOC) as $r) {
        $counts[(int)$r['dow']] += (int)$r['cnt'];
    }
} catch (Exception $e) {}

$max = max($counts) ?: 1;
echo json_encode(['counts' => array_values($counts), 'max' => $max]);
