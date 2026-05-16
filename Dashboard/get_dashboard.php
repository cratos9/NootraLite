<?php
if (session_status() === PHP_SESSION_NONE) session_start();
header('Content-Type: application/json');
if (empty($_SESSION['user']['id'])) { echo json_encode(['ok'=>false]); exit; }
require_once '../config/db.php';
require_once '../Models/MessageModel.php';
$uid = (int)$_SESSION['user']['id'];
$db  = new Database(); $pdo = $db->connect();
$out = ['ok'=>true];

// stats
$stats = ['msg_unread'=>0,'msg_sent'=>0,'conv_active'=>0,'events_today'=>0,'events_deadline'=>0,'events_week'=>0,'tasks_pending'=>0,'tasks_done'=>0,'notes_week'=>0,'notes_total'=>0,'bookmarks'=>0];
$sq = [
    'msg_unread'      => ['SELECT COUNT(*) FROM messages m JOIN conversations c ON c.id=m.conversation_id WHERE (c.user1_id=? OR c.user2_id=?) AND m.sender_id!=? AND m.is_read=0', [$uid,$uid,$uid]],
    'msg_sent'        => ['SELECT COUNT(*) FROM messages WHERE sender_id=? AND DATE(created_at)=CURDATE()', [$uid]],
    'conv_active'     => ['SELECT COUNT(*) FROM conversations WHERE user1_id=? OR user2_id=?', [$uid,$uid]],
    'events_today'    => ['SELECT COUNT(*) FROM tasks WHERE user_id=? AND DATE(start_datetime)=CURDATE()', [$uid]],
    'events_deadline' => ['SELECT COUNT(*) FROM tasks WHERE user_id=? AND start_datetime BETWEEN NOW() AND DATE_ADD(NOW(),INTERVAL 3 DAY)', [$uid]],
    'events_week'     => ['SELECT COUNT(*) FROM tasks WHERE user_id=? AND YEARWEEK(start_datetime,1)=YEARWEEK(NOW(),1)', [$uid]],
    'tasks_pending'   => ['SELECT COUNT(*) FROM tasks WHERE user_id=? AND is_done=0', [$uid]],
    'tasks_done'      => ['SELECT COUNT(*) FROM tasks WHERE user_id=? AND is_done=1', [$uid]],
    'notes_week'      => ['SELECT COUNT(*) FROM notes WHERE user_id=? AND YEARWEEK(created_at,1)=YEARWEEK(NOW(),1)', [$uid]],
    'notes_total'     => ['SELECT COUNT(*) FROM notes WHERE user_id=?', [$uid]],
    'bookmarks'       => ['SELECT COUNT(*) FROM message_bookmarks WHERE user_id=?', [$uid]],
];
foreach ($sq as $k => $v) {
    try { $s=$pdo->prepare($v[0]); $s->execute($v[1]); $stats[$k]=(int)$s->fetchColumn(); } catch(Exception $e){}
}
$out['stats'] = $stats;

// mensajes (top 3)
$avColors = ['#7c3aed','#ec4899','#6366f1','#06b6d4','#10b981','#f59e0b','#3b82f6','#8b5cf6'];
function dashGdHash($n) { $s=0; $l=mb_strlen($n,'UTF-8'); for($i=0;$i<$l;$i++) $s+=mb_ord(mb_substr($n,$i,1,'UTF-8'),'UTF-8'); return $s; }
$att_l=['image'=>'Imagen','file'=>'Archivo','audio'=>'Audio','location'=>'Ubicación','contact'=>'Contacto'];
$att_i=['image'=>'image','file'=>'paperclip','audio'=>'mic','location'=>'map-pin','contact'=>'user'];
$total_unread = 0; $convs = [];
try {
    $model = new MessageModel($pdo);
    $all   = $model->getConversations($uid);
    $total_unread = (int)array_sum(array_column($all, 'unread'));
    $slice = array_slice($all, 0, 3);
    foreach ($slice as &$c) {
        $c['avatar_color'] = $avColors[dashGdHash($c['other_name']??'U') % count($avColors)];
        $pts = preg_split('/\s+/', trim($c['other_name']??'U'));
        $c['initials'] = count($pts)>1 ? strtoupper(mb_substr($pts[0],0,1).mb_substr(end($pts),0,1)) : strtoupper(mb_substr($pts[0],0,2));
        $ts = strtotime($c['last_time']??''); $now = time();
        if (!$ts)             $c['time_fmt'] = '';
        elseif ($now-$ts<60)  $c['time_fmt'] = 'Ahora';
        elseif ($now-$ts<3600)$c['time_fmt'] = (int)(($now-$ts)/60).'m';
        elseif ($now-$ts<86400)$c['time_fmt']= date('H:i',$ts);
        elseif ($now-$ts<172800)$c['time_fmt']='Ayer';
        else $c['time_fmt'] = date('d/m',$ts);
        if (!empty($c['last_deleted_for_all'])) {
            $c['last_preview']='Mensaje eliminado'; $c['preview_icon']='x-circle'; $c['preview_is_system']=true;
        } elseif (!empty($c['last_attachment_type']) && isset($att_l[$c['last_attachment_type']])) {
            $t=$c['last_attachment_type']; $c['last_preview']=$att_l[$t]; $c['preview_icon']=$att_i[$t]??'paperclip'; $c['preview_is_system']=false;
        } else {
            $c['last_preview']=mb_substr(trim($c['last_msg']??''),0,72); $c['preview_icon']=null; $c['preview_is_system']=false;
        }
        $c['is_mine']      = isset($c['last_sender_id']) && (int)$c['last_sender_id']===$uid;
        $c['is_unread']    = ($c['unread']>0 || !empty($c['force_unread']));
        $c['is_recording'] = !empty($c['is_recording']);
        unset($c['user1_id'],$c['user2_id'],$c['last_msg'],$c['last_time'],$c['last_attachment_type'],
              $c['is_favorite'],$c['is_pinned'],$c['is_muted'],$c['last_deleted_for_all'],$c['last_sender_id']);
    } unset($c);
    $convs = $slice;
} catch(Exception $e){}
$out['messages'] = ['ok'=>true, 'conversations'=>$convs, 'total_unread'=>$total_unread];

// actividad semanal
$lunes   = date('Y-m-d', strtotime('monday this week'));
$domingo = date('Y-m-d', strtotime('sunday this week'));
$ac      = array_fill(0, 7, 0);
foreach (['messages'=>'sender_id','tasks'=>'user_id','notebooks'=>'user_id','notes'=>'user_id'] as $tbl=>$col) {
    try {
        $s=$pdo->prepare("SELECT WEEKDAY(created_at) d, COUNT(*) c FROM $tbl WHERE $col=? AND DATE(created_at) BETWEEN ? AND ? GROUP BY WEEKDAY(created_at)");
        $s->execute([$uid,$lunes,$domingo]);
        foreach ($s->fetchAll(PDO::FETCH_ASSOC) as $r) $ac[(int)$r['d']] += (int)$r['c'];
    } catch(Exception $e){}
}
$out['activity'] = ['counts'=>array_values($ac), 'max'=>max($ac)?:1];

// calendario mes actual
$yr=(int)date('Y'); $mo=(int)date('n');
$cstart=sprintf('%04d-%02d-01',$yr,$mo); $cend=date('Y-m-t',strtotime($cstart));
$edays=[];
try {
    $s=$pdo->prepare("SELECT DISTINCT DAY(start_datetime) d FROM tasks WHERE user_id=? AND DATE(start_datetime) BETWEEN ? AND ? AND is_done=0");
    $s->execute([$uid,$cstart,$cend]);
    $edays = array_map('intval', array_column($s->fetchAll(PDO::FETCH_ASSOC),'d'));
} catch(Exception $e){}
$out['event_days_current'] = array_values($edays);

echo json_encode($out);
