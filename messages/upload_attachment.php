<?php
require_once '../config/db.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || empty($_FILES['file'])) {
    echo json_encode(['ok' => false, 'error' => 'sin archivo']);
    exit;
}

$file = $_FILES['file'];
if ($file['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(['ok' => false, 'error' => 'error al subir']);
    exit;
}

if ($file['size'] > 5 * 1024 * 1024) {
    echo json_encode(['ok' => false, 'error' => 'archivo muy grande (máx 5 MB)']);
    exit;
}

$imageExts = ['jpg','jpeg','png','gif','webp'];
$fileExts  = ['pdf','doc','docx','xls','xlsx','zip','rar'];
$audioExts = ['webm','ogg','mp3','m4a','wav'];
$ext       = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

if (!in_array($ext, array_merge($imageExts, $fileExts, $audioExts))) {
    echo json_encode(['ok' => false, 'error' => 'tipo de archivo no permitido']);
    exit;
}

$isImage = in_array($ext, $imageExts);
$isAudio = in_array($ext, $audioExts);
if ($isImage && !getimagesize($file['tmp_name'])) {
    echo json_encode(['ok' => false, 'error' => 'archivo de imagen inválido']);
    exit;
}

$safeName = preg_replace('/[^\w.\-]/', '_', basename($file['name']));
$newName  = time() . '_' . $safeName;
$subdir   = $isAudio ? 'audio/' : '';
$dir      = __DIR__ . '/../uploads/messages/' . $subdir;
if (!is_dir($dir)) mkdir($dir, 0755, true);

if (!move_uploaded_file($file['tmp_name'], $dir . $newName)) {
    echo json_encode(['ok' => false, 'error' => 'error al guardar archivo']);
    exit;
}

$type = $isImage ? 'image' : ($isAudio ? 'audio' : 'file');
$urlPath = 'uploads/messages/' . $subdir . $newName;

echo json_encode([
    'ok'   => true,
    'url'  => '../' . $urlPath,
    'type' => $type,
    'name' => $file['name'],
    'size' => (int)$file['size'],
]);
exit;
