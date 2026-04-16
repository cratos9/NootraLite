<?php
require_once '../includes/Remember.php';
require_once '../includes/lightMode.php';
require_once '../Models/UserModel.php';
require_once '../includes/attachments.php';

$activePage = 'profile';
include '../includes/sidebar.php';

$userID = $_SESSION['user']['id'];
$database = new Database();
try {
    $conn = $database->connect();
} catch (Exception $e) {
    die('Error en la conexión a la base de datos');
}
$user = new User($conn);

$getPhoto = $_SESSION['user']['avatar_url'] ?? "default.png";
$message = '';
$messageType = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['edit_photo'])) {
    try {
        $attachments = new Attachments();
        list($destination, $fileName) = $attachments->uploadAttachment($_FILES['photo']);
        
        if ($user->UpdateProfilePhoto($userID, $fileName)) {
            $_SESSION['user']['avatar_url'] = $fileName;
            $getPhoto = $fileName;
            $message = 'Foto de perfil actualizada correctamente';
            $messageType = 'success';
        } else {
            $message = 'Error al guardar la foto en la base de datos';
            $messageType = 'error';
        }
    } catch (Exception $e) {
        $message = $e->getMessage();
        $messageType = 'error';
    }
}

include 'Views/EditProfilePhotoView.php';
?>