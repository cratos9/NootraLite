<?php

require_once '../includes/Remember.php';
require_once '../Models/UserModel.php';
require_once '../includes/lightMode.php';

$activePage = 'profile';

$message = null;

$database = new Database();
try {
    $conn = $database->connect();
} catch (Exception $e) {
    die('Error en la conexión a la base de datos');
}
$user = new User($conn);

if ($_SERVER['REQUEST_METHOD'] === 'POST'){
    $id = $_SESSION['user']['id'];
    $password = $_POST['password'];

    if (empty($password)) {
        $message = "Por favor, ingresa tu contraseña para confirmar.";
        include 'Views/DeleteAccountView.php';
        exit();
    }

    $response = $user->DeleteAccount($id, $password);
    if ($response != false){
        session_destroy();
        header('Location: ../index.php');
    } else {
        $message = "Contraseña incorrecta. Inténtalo de nuevo.";
    }
}
include 'Views/DeleteAccountView.php';
if (isset($message)) {
    echo '
    <script>
    message.error("' . $message . '");
    </script>';
}
?>