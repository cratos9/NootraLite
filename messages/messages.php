<?php
require_once '../config/db.php';
require_once '../Models/MessageModel.php';

if (session_status() === PHP_SESSION_NONE) session_start();
$activePage = 'messages';

$database = new Database();
$pdo = $database->connect();

$uid = $_SESSION['user']['id'] ?? 1;
$model = new MessageModel($pdo);
$conversations = $model->getConversations($uid);

require_once 'Views/MessagesView.php';
?>
