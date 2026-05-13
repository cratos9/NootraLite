<?php

session_start();

require_once '../../config/db.php';
require_once '../../Models/TaskModel.php';

$database = new Database();

$db = $database->connect();

$model = new TaskModel($db);

$action = $_GET['action'] ?? '';

if($action === 'create'){

    $uid = $_SESSION['user']['id'];

    $title = $_POST['title'];
    $description = $_POST['description'];

    $priority = $_POST['priority'];
    $category = $_POST['category'];

    $tags = $_POST['tags'];

    $start_dt = $_POST['start_dt'];
    $end_dt = $_POST['end_dt'];

    $all_day = isset($_POST['all_day']) ? 1 : 0;

    $model->create(
        $uid,
        $title,
        $description,
        $priority,
        $category,
        $tags,
        $start_dt,
        $end_dt,
        $all_day
    );

    header("Location: ../index.php");

    exit;
}

if($action === 'delete'){

    $id = $_GET['id'];

    $model->delete(
        $id,
        $_SESSION['user']['id']
    );

    header("Location: ../index.php");

    exit;
}

if($action === 'update'){

    $id = $_POST['id'];

    $uid = $_SESSION['user']['id'];

    $title = $_POST['title'];
    $description = $_POST['description'];

    $priority = $_POST['priority'];
    $category = $_POST['category'];

    $tags = $_POST['tags'];

    $start_dt = $_POST['start_dt'];
    $end_dt = $_POST['end_dt'];

    $all_day = isset($_POST['all_day']) ? 1 : 0;

    $model->update(
        $id,
        $uid,
        $title,
        $description,
        $priority,
        $category,
        $tags,
        $start_dt,
        $end_dt,
        $all_day
    );

    header("Location: ../index.php");

    exit;
}