<?php
if (session_status() === PHP_SESSION_NONE) session_start();
header('Content-Type: application/json; charset=utf-8');

if (empty($_SESSION['user']['id'])) {
    echo json_encode(['ok'=>false,'results'=>[]]);
    exit;
}

require_once '../config/db.php';
require_once '../config/encrypt.php';

$q   = trim($_GET['q'] ?? '');
$uid = (int)$_SESSION['user']['id'];

if (mb_strlen($q) < 2) {
    echo json_encode(['ok'=>true,'q'=>$q,'results'=>[]]);
    exit;
}

$db  = new Database();
$pdo = $db->connect();
$out = [];

$qLike = '%' . addcslashes($q, '%_\\') . '%';

function tryDecrypt($str) {
    if (!$str) return '';
    $dec = decrypt_data($str);
    if ($dec === false) return $str;
    return mb_check_encoding($dec, 'UTF-8') ? $dec : $str;
}

// -- 1. modulos (atajos de navegacion) --
$modules = [
    ['name'=>'Dashboard',     'icon'=>'layout-dashboard', 'url'=>'../Dashboard/index.php',           'desc'=>'Panel principal',     'kw'=>'inicio home panel actividad resumen estadisticas'],
    ['name'=>'Calendario',    'icon'=>'calendar',         'url'=>'../calendar/calendar.php',         'desc'=>'Ver mis eventos',     'kw'=>'evento fecha agenda cita recordatorio hora dia mes semana'],
    ['name'=>'Mensajes',      'icon'=>'message-circle',   'url'=>'../messages/messages.php',         'desc'=>'Conversaciones',      'kw'=>'chat conversar hablar contacto dm directo inbox'],
    ['name'=>'Tareas',        'icon'=>'check-square',     'url'=>'../task/index.php',                'desc'=>'Gestionar tareas',    'kw'=>'todo pendiente completar hacer lista deberes actividad'],
    ['name'=>'Cuadernos',     'icon'=>'book-open',        'url'=>'../Books/Books.php',               'desc'=>'Cuadernos y notas',   'kw'=>'libro apunte notebook escolar clase materia notas'],
    ['name'=>'Notas rápidas', 'icon'=>'notepad-text',     'url'=>'../QuickNotes/index.php',          'desc'=>'Notas rápidas',       'kw'=>'quick idea bloc apunte memo post-it sticker'],
    ['name'=>'Archivos',      'icon'=>'paperclip',        'url'=>'../Attachments/NewAttachment.php', 'desc'=>'Adjuntos y archivos', 'kw'=>'documento subir pdf file adjuntar upload adjunto'],
];
$modItems = [];
foreach ($modules as $m) {
    $hay = $m['name'] . ' ' . $m['desc'] . ' ' . ($m['kw'] ?? '');
    if (mb_stripos($hay, $q) !== false) {
        $modItems[] = ['title'=>$m['name'],'sub'=>$m['desc'],'url'=>$m['url'],'icon'=>$m['icon']];
    }
}
if ($modItems) $out[] = ['label'=>'Módulos','icon'=>'compass','color'=>'purple','items'=>$modItems];

// -- 2. cuenta (perfil y configuraciones) --
$accountPages = [
    ['name'=>'Mi Perfil',         'icon'=>'user',         'url'=>'../User/Profile.php',          'desc'=>'Ver mi perfil',               'kw'=>'perfil cuenta usuario ver'],
    ['name'=>'Editar Perfil',     'icon'=>'user-pen',     'url'=>'../User/EditProfile.php',      'desc'=>'Actualizar datos personales', 'kw'=>'editar datos bio institucion carrera ciudad pais personal'],
    ['name'=>'Foto de Perfil',    'icon'=>'camera',       'url'=>'../User/EditProfilePhoto.php', 'desc'=>'Cambiar foto o avatar',       'kw'=>'foto imagen avatar cambiar'],
    ['name'=>'Contraseña',        'icon'=>'key-round',    'url'=>'../User/EditPassword.php',     'desc'=>'Cambiar contraseña',          'kw'=>'contrasena clave password cambiar seguridad'],
    ['name'=>'Suscripciones',     'icon'=>'sparkles',     'url'=>'../User/Subscriptions.php',    'desc'=>'Planes y suscripción',        'kw'=>'suscripcion plan premium pago'],
    ['name'=>'Autenticación 2FA', 'icon'=>'shield-check', 'url'=>'../User/TwoFactorAuth.php',    'desc'=>'Verificación en dos pasos',   'kw'=>'2fa autenticacion dos factores seguridad verificacion'],
];
$acctItems = [];
foreach ($accountPages as $p) {
    $hay = $p['name'].' '.$p['desc'].' '.$p['kw'];
    if (mb_stripos($hay, $q) !== false) {
        $acctItems[] = ['title'=>$p['name'],'sub'=>$p['desc'],'url'=>$p['url'],'icon'=>$p['icon']];
    }
}
if ($acctItems) $out[] = ['label'=>'Cuenta','icon'=>'circle-user','color'=>'violet','items'=>$acctItems];

// -- 2b. acciones rapidas (logout, toggle tema, atajos de creacion) --
$allActions = [
    ['name'=>'Cerrar sesión',     'icon'=>'log-out',      'url'=>'../User/Logout.php',              'kw'=>'salir logout cerrar sesion'],
    ['name'=>'Modo claro',        'icon'=>'sun',           'url'=>'#',                               'kw'=>'tema claro modo luz toggle switch',   'jsa'=>'toggle-theme'],
    ['name'=>'Modo oscuro',       'icon'=>'moon',          'url'=>'#',                               'kw'=>'oscuro dark modo noche toggle switch', 'jsa'=>'toggle-theme'],
    ['name'=>'Nuevo cuaderno',    'icon'=>'book-plus',     'url'=>'../Books/NewBook.php',            'kw'=>'cuaderno nuevo crear libro agregar'],
    ['name'=>'Nueva nota rápida', 'icon'=>'notepad-text',  'url'=>'../QuickNotes/index.php',         'kw'=>'nota rapida nueva crear quick apunte'],
    ['name'=>'Nueva tarea',       'icon'=>'circle-plus',   'url'=>'../task/index.php',               'kw'=>'tarea crear nueva agregar pendiente todo hacer'],
    ['name'=>'Nuevo evento',      'icon'=>'calendar-plus', 'url'=>'../calendar/calendar.php',        'kw'=>'evento crear nuevo agregar calendario cita fecha'],
];
$actnItems = [];
foreach ($allActions as $a) {
    if (mb_stripos($a['name'].' '.$a['kw'], $q) !== false) {
        $item = ['title'=>$a['name'], 'sub'=>'Acción rápida', 'url'=>$a['url'], 'icon'=>$a['icon']];
        if (isset($a['jsa'])) $item['js_action'] = $a['jsa'];
        $actnItems[] = $item;
    }
}
if ($actnItems) $out[] = ['label'=>'Acciones','icon'=>'zap','color'=>'blue','items'=>$actnItems];

// -- 2c. cuadernos (title/category/tags encriptado, busca PHP-side) --
try {
    $stmt = $pdo->prepare(
        "SELECT id, title, category, tags, color FROM notebooks
          WHERE user_id=? ORDER BY COALESCE(last_accessed, created_at) DESC LIMIT 60"
    );
    $stmt->execute([$uid]);
    $rows  = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $items = [];
    foreach ($rows as $r) {
        $title = tryDecrypt($r['title']);
        $cat   = tryDecrypt($r['category']);
        $tags  = tryDecrypt($r['tags']);
        if (mb_stripos($title, $q) === false && mb_stripos($cat, $q) === false && mb_stripos($tags, $q) === false) continue;
        $items[] = [
            'title'     => $title,
            'sub'       => $cat ?: '',
            'url'       => '../Books/Book.php?id='.(int)$r['id'],
            'icon'      => 'book-open',
            'dot_color' => $r['color'] ?? '#7c3aed',
        ];
        if (count($items) >= 4) break;
    }
    if ($items) $out[] = [
        'label'  => 'Cuadernos',
        'icon'   => 'book-open',
        'color'  => 'purple',
        'items'  => $items,
        'footer' => ['text'=>'Ver cuadernos','url'=>'../Books/Books.php'],
    ];
} catch(Exception $e) {}

// -- 2d. notas (title encriptado, join notebooks para color+nombre) --
try {
    $stmt = $pdo->prepare(
        "SELECT n.id, n.title, n.notebook_id, nb.color AS nb_color, nb.title AS nb_title
           FROM notes n
           JOIN notebooks nb ON nb.id = n.notebook_id
          WHERE n.user_id=?
          ORDER BY COALESCE(n.last_accessed, n.created_at) DESC LIMIT 100"
    );
    $stmt->execute([$uid]);
    $rows  = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $items = [];
    foreach ($rows as $r) {
        $title   = tryDecrypt($r['title']);
        $nbTitle = tryDecrypt($r['nb_title']);
        if (mb_stripos($title, $q) === false && mb_stripos($nbTitle, $q) === false) continue;
        $items[] = [
            'title'     => $title,
            'sub'       => $nbTitle ?: '',
            'url'       => '../Notes/Note.php?note_id='.(int)$r['id'].'&book_id='.(int)$r['notebook_id'],
            'icon'      => 'file-text',
            'dot_color' => $r['nb_color'] ?? '#7c3aed',
        ];
        if (count($items) >= 5) break;
    }
    if ($items) $out[] = [
        'label'  => 'Notas',
        'icon'   => 'notebook-pen',
        'color'  => 'violet',
        'items'  => $items,
        'footer' => ['text'=>'Ver cuadernos','url'=>'../Books/Books.php'],
    ];
} catch(Exception $e) {}

// -- 2e. notas rapidas (note encriptado) --
try {
    $stmt = $pdo->prepare(
        "SELECT id, note, color FROM quick_notes WHERE user_id=? ORDER BY created_at DESC LIMIT 60"
    );
    $stmt->execute([$uid]);
    $rows  = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $items = [];
    foreach ($rows as $r) {
        $text = tryDecrypt($r['note']);
        if (mb_stripos($text, $q) === false) continue;
        $snip = mb_strlen($text) > 50 ? mb_substr($text, 0, 50).'…' : $text;
        $items[] = [
            'title'     => $snip,
            'sub'       => '',
            'url'       => '../QuickNotes/index.php',
            'icon'      => 'notepad-text',
            'dot_color' => $r['color'] ?? '#7c3aed',
        ];
        if (count($items) >= 4) break;
    }
    if ($items) $out[] = [
        'label'  => 'Notas rápidas',
        'icon'   => 'notepad-text',
        'color'  => 'amber',
        'items'  => $items,
        'footer' => ['text'=>'Ver notas rápidas','url'=>'../QuickNotes/index.php'],
    ];
} catch(Exception $e) {}

// -- 3. eventos de calendario (title plain text, tambien busca por category) --
try {
    $stmt = $pdo->prepare(
        "SELECT id, title, color, category, start_datetime FROM tasks
          WHERE user_id=? AND color IS NOT NULL
            AND (title LIKE ? OR (category IS NOT NULL AND category LIKE ?))
          ORDER BY start_datetime ASC LIMIT 5"
    );
    $stmt->execute([$uid, $qLike, $qLike]);
    $rows  = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $items = [];
    foreach ($rows as $r) {
        $ts   = $r['start_datetime'] ? strtotime($r['start_datetime']) : null;
        $date = $ts ? date('d M, H:i', $ts) : '';
        $day  = $ts ? date('j', $ts) : '';
        $sub  = $r['category'] ? $r['category'].($date ? ' · '.$date : '') : $date;
        $items[] = [
            'title'     => $r['title'],
            'sub'       => $sub,
            'url'       => $ts ? '../calendar/calendar.php?day=' . date('Y-m-d', $ts) : '../calendar/calendar.php',
            'icon'      => 'calendar-days',
            'dot_color' => $r['color'] ?? '#7c3aed',
            'date_day'  => $day,
        ];
    }
    if ($items) $out[] = [
        'label'  => 'Eventos',
        'icon'   => 'calendar',
        'color'  => 'amber',
        'items'  => $items,
        'footer' => ['text'=>'Ver calendario','url'=>'../calendar/calendar.php'],
    ];
} catch(Exception $e) {}

// -- 4. tareas del modulo task (todos los campos encriptados, busca PHP-side) --
try {
    $stmt = $pdo->prepare(
        "SELECT id, title, status, priority, category, tags, start_datetime FROM tasks
          WHERE user_id=? AND color IS NULL
          ORDER BY start_datetime DESC LIMIT 150"
    );
    $stmt->execute([$uid]);
    $rows  = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $items = [];
    foreach ($rows as $r) {
        $title = tryDecrypt($r['title']);
        $cat   = tryDecrypt($r['category']);
        $tags  = tryDecrypt($r['tags']);
        $matchTitle = mb_stripos($title, $q) !== false;
        $matchCat   = $cat  && mb_stripos($cat,  $q) !== false;
        $matchTags  = $tags && mb_stripos($tags, $q) !== false;
        if ($matchTitle || $matchCat || $matchTags) {
            $done  = ($r['status'] === 'completed' || $r['status'] === 'done');
            $prio  = $r['priority'] ?? '';
            $sub   = $cat ?: ($done ? 'Completada' : 'Pendiente');
            $badge = null; $badgeColor = null;
            if ($done)               { $badge = 'Hecha'; $badgeColor = '#10b981'; }
            elseif ($prio === 'high')   { $badge = 'Alta';  $badgeColor = '#ef4444'; }
            elseif ($prio === 'medium') { $badge = 'Media'; $badgeColor = '#f59e0b'; }
            $item = ['title'=>$title,'sub'=>$sub,'url'=>'../task/index.php','icon'=>$done?'check-circle-2':'circle'];
            if ($badge) { $item['badge']=$badge; $item['badge_color']=$badgeColor; }
            $items[] = $item;
            if (count($items) >= 4) break;
        }
    }
    if ($items) $out[] = [
        'label'  => 'Tareas',
        'icon'   => 'check-square',
        'color'  => 'green',
        'items'  => $items,
        'footer' => ['text'=>'Ver tareas','url'=>'../task/index.php'],
    ];
} catch(Exception $e) {}

// -- 5. mensajes (por contacto + contenido) --
try {
    // busca conv por username del contacto + preview del ultimo mensaje
    $attach_labels = [
        'image'    => 'Imagen adjunta',
        'file'     => 'Archivo adjunto',
        'audio'    => 'Mensaje de voz',
        'location' => 'Ubicación',
        'contact'  => 'Contacto compartido',
    ];
    $stmt = $pdo->prepare(
        "SELECT c.id, u.username,
                lm.body AS last_body, lm.attachment_type AS last_attach
           FROM conversations c
           JOIN users u ON u.id = IF(c.user1_id=?, c.user2_id, c.user1_id)
           LEFT JOIN messages lm ON lm.id = (
               SELECT MAX(id) FROM messages
                WHERE conversation_id = c.id AND deleted_for_all = 0
           )
          WHERE (c.user1_id=? OR c.user2_id=?) AND u.username LIKE ?
          LIMIT 3"
    );
    $stmt->execute([$uid, $uid, $uid, $qLike]);
    $convRows  = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $msgItems  = [];
    $seenConvs = [];
    foreach ($convRows as $r) {
        $seenConvs[] = (int)$r['id'];
        if ($r['last_body']) {
            $sub = mb_strlen($r['last_body']) > 45 ? mb_substr($r['last_body'], 0, 45).'…' : $r['last_body'];
        } elseif ($r['last_attach']) {
            $sub = $attach_labels[$r['last_attach']] ?? 'Adjunto';
        } else {
            $sub = 'Conversación directa';
        }
        $msgItems[] = [
            'title'  => $r['username'],
            'avatar' => mb_strtoupper(mb_substr($r['username'], 0, 2)),
            'sub'    => $sub,
            'url'    => '../messages/messages.php?conv='.(int)$r['id'],
            'icon'   => 'user',
        ];
    }

    // busca en contenido de mensajes (ANY_VALUE para ONLY_FULL_GROUP_BY en MySQL 8.4)
    $stmt2 = $pdo->prepare(
        "SELECT m.conversation_id,
                LEFT(ANY_VALUE(m.body), 60) AS snippet,
                ANY_VALUE(u.username)       AS other
           FROM messages m
           JOIN conversations c ON c.id = m.conversation_id
           JOIN users u ON u.id = IF(c.user1_id=?, c.user2_id, c.user1_id)
          WHERE (c.user1_id=? OR c.user2_id=?)
            AND m.body LIKE ?
            AND m.deleted_for_all = 0
          GROUP BY m.conversation_id
          ORDER BY MAX(m.created_at) DESC
          LIMIT 3"
    );
    $stmt2->execute([$uid, $uid, $uid, $qLike]);
    foreach ($stmt2->fetchAll(PDO::FETCH_ASSOC) as $r) {
        if (in_array((int)$r['conversation_id'], $seenConvs)) continue;
        $seenConvs[] = (int)$r['conversation_id'];
        $snip = $r['snippet'];
        $msgItems[] = [
            'title'  => $r['other'],
            'avatar' => mb_strtoupper(mb_substr($r['other'], 0, 2)),
            'sub'    => mb_strlen($snip) > 50 ? mb_substr($snip, 0, 50).'…' : $snip,
            'url'    => '../messages/messages.php?conv='.(int)$r['conversation_id'],
            'icon'   => 'message-square',
        ];
        if (count($msgItems) >= 5) break;
    }
    if ($msgItems) $out[] = [
        'label'  => 'Mensajes',
        'icon'   => 'message-circle',
        'color'  => 'blue',
        'items'  => $msgItems,
        'footer' => ['text'=>'Ir a mensajes','url'=>'../messages/messages.php'],
    ];
} catch(Exception $e) {}

echo json_encode(['ok'=>true,'q'=>$q,'results'=>$out]);
