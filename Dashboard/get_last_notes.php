<?php

include_once '../config/db.php';
include_once '../config/encrypt.php';
require_once '../Models/NoteModel.php';

$database = new Database();
try {
    $conn = $database->connect();
} catch (Exception $e) {
    die('Error en la conexión a la base de datos');
}

$noteModel = new Note($conn);
$lastNotes = $noteModel->getLastAccessedNotesByUserId($_SESSION['user']['id'], 3);

?>