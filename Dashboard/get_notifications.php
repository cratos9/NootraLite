<?php
require_once '../config/db.php';
header('Content-Type: application/json');
header('Cache-Control: no-store');
if (session_status() === PHP_SESSION_NONE) session_start();

$uid = $_SESSION['user']['id'] ?? null;
if (!$uid) { echo json_encode(['ok' => false]); exit; }

$pdo = (new Database())->connect();
$out = ['ok' => true, 'messages' => [], 'events' => [], 'total' => 0];

$avColors = ['#7c3aed','#ec4899','#6366f1','#06b6d4','#10b981','#f59e0b','#3b82f6','#8b5cf6'];
function notifAvatarColor($name, $colors) {
    $s = 0;
    for ($i = 0; $i < strlen($name); $i++) $s += ord($name[$i]);
    return $colors[$s % count($colors)];
}
function notifInitials($name) {
    $clean = preg_replace('/[^a-zA-Z]/', '', $name);
    return strtoupper(substr($clean, 0, 2)) ?: 'U';
}
function notifTimeFmt($dt) {
    $diff = (new DateTime())->getTimestamp() - $dt->getTimestamp();
    if ($diff < 60)    return 'ahora';
    if ($diff < 3600)  return floor($diff / 60) . 'm';
    if ($diff < 86400) return floor($diff / 3600) . 'h';
    return $dt->format('d/m');
}

// mensajes no leidos por conversacion (ignora silenciadas)
try {
    $st = $pdo->prepare("
        SELECT c.id,
               CASE WHEN c.user1_id = :uid THEN u2.username ELSE u1.username END AS name,
               COUNT(m.id) AS unread,
               MAX(m.created_at) AS last_time
        FROM conversations c
        JOIN users u1 ON u1.id = c.user1_id
        JOIN users u2 ON u2.id = c.user2_id
        JOIN messages m ON m.conversation_id = c.id
            AND m.sender_id != :uid2
            AND m.is_read = 0
            AND m.deleted_for_all = 0
        WHERE (c.user1_id = :uid4 OR c.user2_id = :uid5)
          AND (CASE WHEN c.user1_id = :uid6 THEN c.is_muted_u1 ELSE c.is_muted_u2 END) = 0
        GROUP BY c.id
        ORDER BY last_time DESC
        LIMIT 5
    ");
    $st->execute([
        ':uid' => $uid, ':uid2' => $uid,
        ':uid4' => $uid, ':uid5' => $uid, ':uid6' => $uid,
    ]);
    while ($row = $st->fetch(PDO::FETCH_ASSOC)) {
        $dt = new DateTime($row['last_time']);
        $out['messages'][] = [
            'conv_id'      => (int)$row['id'],
            'name'         => $row['name'],
            'unread'       => (int)$row['unread'],
            'avatar_color' => notifAvatarColor($row['name'], $avColors),
            'initials'     => notifInitials($row['name']),
            'time_fmt'     => notifTimeFmt($dt),
        ];
    }
} catch (Exception $e) {}

// eventos de hoy y manana sin completar
try {
    $st = $pdo->prepare("
        SELECT id, title, color, start_datetime, all_day
        FROM tasks
        WHERE user_id = ?
          AND start_datetime BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 1 DAY)
          AND is_done = 0
        ORDER BY all_day ASC, start_datetime ASC
        LIMIT 5
    ");
    $st->execute([$uid]);
    $today = (new DateTime())->format('Y-m-d');
    while ($row = $st->fetch(PDO::FETCH_ASSOC)) {
        $dt      = new DateTime($row['start_datetime']);
        $isToday = $dt->format('Y-m-d') === $today;
        $time    = $row['all_day'] ? '' : $dt->format('H:i');
        $diff    = $dt->getTimestamp() - (new DateTime())->getTimestamp();
        $out['events'][] = [
            'id'       => (int)$row['id'],
            'title'    => $row['title'],
            'color'    => $row['color'] ?: '#7c3aed',
            'time_fmt' => ($isToday ? 'Hoy' : 'Mañana') . ($time ? ' · ' . $time : ''),
            'is_soon'  => !$row['all_day'] && $diff >= 0 && $diff <= 1800,
            'is_now'   => !$row['all_day'] && $diff > -3600 && $diff <= 0,
        ];
    }
} catch (Exception $e) {}

$out['total'] = array_sum(array_column($out['messages'], 'unread')) + count($out['events']);
echo json_encode($out);
exit;