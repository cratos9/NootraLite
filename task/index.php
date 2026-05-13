<?php

session_start();

require_once '../config/db.php';
require_once '../Models/TaskModel.php';

include_once '../config/encrypt.php';

include_once '../includes/lightMode.php';
include_once '../includes/Remember.php';
include '../includes/sidebar.php';

$database = new Database();

$db = $database->connect();

$model = new TaskModel($db);

$tasks = $model->getTasks($_SESSION['user']['id']);

include 'Views/indexView.php';
