<?php

include_once '../config/db.php';
include_once '../config/encrypt.php';
require_once '../Models/QuickNotesModel.php';

$database = new Database();
try {
    $conn = $database->connect();
} catch (Exception $e) {
    die('Error en la conexión a la base de datos');
}

$quickNoteModel = new QuickNote($conn);
$lastQuickNotes = $quickNoteModel->GetLastThree($_SESSION['user']['id'], 3);

?>