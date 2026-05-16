<?php
if (session_status() === PHP_SESSION_NONE) session_start();
header('Content-Type: application/json');

if (empty($_SESSION['user']['id'])) {
    echo json_encode(['ok' => false, 'conversations' => [], 'total_unread' => 0]);
    exit;
}

require_once '../config/db.php';
require_once '../Models/MessageModel.php';

$uid   = (int)$_SESSION['user']['id'];
$db    = new Database();
$pdo   = $db->connect();
$model = new MessageModel($pdo);

try {
    $all = $model->getConversations($uid);
} catch (Exception $e) {
    echo json_encode(['ok' => false, 'conversations' => [], 'total_unread' => 0]);
    exit;
}

// total unread de TODAS las convs antes de cortar
$total_unread = (int)array_sum(array_column($all, 'unread'));

$convs = array_slice($all, 0, 3);

// mismo array y hash que messages-utils.js para consistencia entre módulos
$avColors = ['#7c3aed','#ec4899','#6366f1','#06b6d4','#10b981','#f59e0b','#3b82f6','#8b5cf6'];
function avHash($name) {
    $sum = 0;
    $len = mb_strlen($name, 'UTF-8');
    for ($i = 0; $i < $len; $i++) $sum += mb_ord(mb_substr($name, $i, 1, 'UTF-8'), 'UTF-8');
    return $sum;
}

$att_labels = [
    'image'    => 'Imagen',
    'file'     => 'Archivo',
    'audio'    => 'Audio',
    'location' => 'Ubicación',
    'contact'  => 'Contacto',
];
$att_icons = [
    'image'    => 'image',
    'file'     => 'paperclip',
    'audio'    => 'mic',
    'location' => 'map-pin',
    'contact'  => 'user',
];

foreach ($convs as &$c) {
    // color único, misma lógica que messages-utils.js
    $c['avatar_color'] = $avColors[avHash($c['other_name'] ?? 'U') % count($avColors)];

    // iniciales (1 o 2 palabras)
    $parts = preg_split('/\s+/', trim($c['other_name'] ?? 'U'));
    $c['initials'] = count($parts) > 1
        ? strtoupper(mb_substr($parts[0], 0, 1) . mb_substr(end($parts), 0, 1))
        : strtoupper(mb_substr($parts[0], 0, 2));

    // tiempo legible
    $ts  = strtotime($c['last_time'] ?? '');
    $now = time();
    if (!$ts) {
        $c['time_fmt'] = '';
    } elseif ($now - $ts < 60) {
        $c['time_fmt'] = 'Ahora';
    } elseif ($now - $ts < 3600) {
        $c['time_fmt'] = (int)(($now - $ts) / 60) . 'm';
    } elseif ($now - $ts < 86400) {
        $c['time_fmt'] = date('H:i', $ts);
    } elseif ($now - $ts < 172800) {
        $c['time_fmt'] = 'Ayer';
    } elseif ($now - $ts < 604800) {
        $dias = ['dom','lun','mar','mié','jue','vie','sáb'];
        $c['time_fmt'] = $dias[(int)date('w', $ts)];
    } else {
        $c['time_fmt'] = date('d/m', $ts);
    }

    // preview del último mensaje
    if (!empty($c['last_deleted_for_all'])) {
        $c['last_preview']      = 'Mensaje eliminado';
        $c['preview_icon']      = 'x-circle';
        $c['preview_is_system'] = true;
    } elseif (!empty($c['last_attachment_type']) && isset($att_labels[$c['last_attachment_type']])) {
        $type = $c['last_attachment_type'];
        $c['last_preview']      = $att_labels[$type];
        $c['preview_icon']      = $att_icons[$type] ?? 'paperclip';
        $c['preview_is_system'] = false;
    } else {
        $c['last_preview']      = mb_substr(trim($c['last_msg'] ?? ''), 0, 72);
        $c['preview_icon']      = null;
        $c['preview_is_system'] = false;
    }

    // ¿el último mensaje fue mío? — viene directo de getConversations
    $c['is_mine'] = isset($c['last_sender_id']) && (int)$c['last_sender_id'] === $uid;

    // flag de no leído (mensajes sin leer O marcado como no leído)
    $c['is_unread'] = ($c['unread'] > 0 || !empty($c['force_unread']));

    // is_recording viene directo de getConversations
    $c['is_recording'] = !empty($c['is_recording']);

    // limpiar campos internos que el front no necesita
    unset($c['user1_id'], $c['user2_id'], $c['last_msg'], $c['last_time'],
          $c['last_attachment_type'], $c['is_favorite'], $c['is_pinned'],
          $c['is_muted'], $c['last_deleted_for_all'], $c['last_sender_id']);
}
unset($c);

echo json_encode([
    'ok'            => true,
    'conversations' => $convs,
    'total_unread'  => $total_unread,
]);
