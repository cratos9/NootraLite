<?php
require_once '../config/db.php';
require_once '../Models/MessageModel.php';

$activePage = 'messages';

$database = new Database();
$pdo = $database->connect();

// user_id fijo hasta que haya sesion
$uid = 1;
$model = new MessageModel($pdo);
$conversations = $model->getConversations($uid);

require_once 'Views/MessagesView.php';
?>
