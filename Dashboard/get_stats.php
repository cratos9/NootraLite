<?php
if (session_status() === PHP_SESSION_NONE) session_start();
header('Content-Type: application/json');

if (empty($_SESSION['user']['id'])) {
    echo json_encode(['msg_unread'=>0,'msg_sent'=>0,'conv_active'=>0,'events_today'=>0,'events_deadline'=>0,'events_week'=>0,'tasks_pending'=>0,'tasks_done'=>0,'notes_week'=>0,'notes_total'=>0,'bookmarks'=>0]);
    exit;
}

require_once '../config/db.php';
$uid = (int)$_SESSION['user']['id'];
$db  = new Database();
$pdo = $db->connect();

$out = ['msg_unread'=>0,'msg_sent'=>0,'conv_active'=>0,'events_today'=>0,'events_deadline'=>0,'events_week'=>0,'tasks_pending'=>0,'tasks_done'=>0,'notes_week'=>0,'notes_total'=>0,'bookmarks'=>0];

try {
    $st = $pdo->prepare('SELECT COUNT(*) FROM messages m JOIN conversations c ON c.id=m.conversation_id WHERE (c.user1_id=? OR c.user2_id=?) AND m.sender_id!=? AND m.is_read=0');
    $st->execute([$uid,$uid,$uid]);
    $out['msg_unread'] = (int)$st->fetchColumn();
} catch(Exception $e) {}

try {
    $st = $pdo->prepare('SELECT COUNT(*) FROM messages WHERE sender_id=? AND DATE(created_at)=CURDATE()');
    $st->execute([$uid]);
    $out['msg_sent'] = (int)$st->fetchColumn();
} catch(Exception $e) {}

try {
    $st = $pdo->prepare('SELECT COUNT(*) FROM conversations WHERE user1_id=? OR user2_id=?');
    $st->execute([$uid,$uid]);
    $out['conv_active'] = (int)$st->fetchColumn();
} catch(Exception $e) {}

try {
    $st = $pdo->prepare('SELECT COUNT(*) FROM tasks WHERE user_id=? AND DATE(start_datetime)=CURDATE()');
    $st->execute([$uid]);
    $out['events_today'] = (int)$st->fetchColumn();
} catch(Exception $e) {}

try {
    $st = $pdo->prepare('SELECT COUNT(*) FROM tasks WHERE user_id=? AND start_datetime BETWEEN NOW() AND DATE_ADD(NOW(),INTERVAL 3 DAY)');
    $st->execute([$uid]);
    $out['events_deadline'] = (int)$st->fetchColumn();
} catch(Exception $e) {}

try {
    $st = $pdo->prepare('SELECT COUNT(*) FROM tasks WHERE user_id=? AND YEARWEEK(start_datetime,1)=YEARWEEK(NOW(),1)');
    $st->execute([$uid]);
    $out['events_week'] = (int)$st->fetchColumn();
} catch(Exception $e) {}

try {
    $st = $pdo->prepare('SELECT COUNT(*) FROM tasks WHERE user_id=? AND is_done=0');
    $st->execute([$uid]);
    $out['tasks_pending'] = (int)$st->fetchColumn();
} catch(Exception $e) {}

try {
    $st = $pdo->prepare('SELECT COUNT(*) FROM tasks WHERE user_id=? AND is_done=1');
    $st->execute([$uid]);
    $out['tasks_done'] = (int)$st->fetchColumn();
} catch(Exception $e) {}

try {
    $st = $pdo->prepare('SELECT COUNT(*) FROM notes WHERE user_id=? AND YEARWEEK(created_at,1)=YEARWEEK(NOW(),1)');
    $st->execute([$uid]);
    $out['notes_week'] = (int)$st->fetchColumn();
} catch(Exception $e) {}

try {
    $st = $pdo->prepare('SELECT COUNT(*) FROM notes WHERE user_id=?');
    $st->execute([$uid]);
    $out['notes_total'] = (int)$st->fetchColumn();
} catch(Exception $e) {}

try {
    $st = $pdo->prepare('SELECT COUNT(*) FROM message_bookmarks WHERE user_id=?');
    $st->execute([$uid]);
    $out['bookmarks'] = (int)$st->fetchColumn();
} catch(Exception $e) {}

echo json_encode($out);
