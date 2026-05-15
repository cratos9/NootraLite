<?php

include_once '../includes/Remember.php';
include_once '../Models/QuickNotesModel.php';

$database = new Database();
try {
    $conn = $database->connect();
} catch (Exception $e) {
    die('Error en la conexión a la base de datos');
}

$note = new QuickNote($conn);

$deleted = $note->Delete($_GET['id'], $_SESSION['user']['id']);

if ($deleted) {
    header('Location: index.php?attachment_msg=' . urlencode('Nota rápida eliminada') . '&attachment_type=success');
    exit;
} else {
    header('Location: index.php?attachment_msg=' . urlencode('No se pudo eliminar la nota') . '&attachment_type=error');
    exit;
}

?>