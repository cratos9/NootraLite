<?php

require_once '../Models/UserModel.php';
require_once '../config/db.php';
require_once '../includes/Remember.php';

$database = new Database();
try {
    $conn = $database->connect();
} catch (Exception $e) {
    die('Error en la conexión a la base de datos');
}
$user = new User($conn);

$message = "";

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (isset($_SESSION['user'])) {
    header('Location: ../Dashboard/index.php');
    exit();
} elseif (isset($_COOKIE['remember_me'])) {
    $token = $_COOKIE['remember_me'];

    if (empty($token)) {
        setcookie('remember_me', '', time() - 3600, '/');
        return;
    }

    $sql = 'SELECT * FROM users WHERE remember_token = ? AND remember_expires > NOW()';
    $stmt = $conn->prepare($sql);
    $stmt->execute([$token]);
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($usuario) {
        session_regenerate_id(true);
        $_SESSION['user'] = $usuario;
    } else {
        setcookie('remember_me', '', time() - 3600, '/');
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = $_POST['email'];
    $password = $_POST['password'];
    $recordar = isset($_POST['remember']);

    $userInfo = $user->Login($email, $password);

    if ($userInfo) {
        if ($recordar) {
            $token = bin2hex(random_bytes(32));
            setcookie('remember_me', $token, time() + (86400 * 7), "/");
            $sql = "UPDATE users SET remember_token = ?, remember_expires = DATE_ADD(NOW(), INTERVAL 7 DAY) WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->execute([$token, $userInfo['id']]);
        }
        if ($user->IsTwoFactorEnabled($userInfo['id'])) {
            $_SESSION['pending_2fa_user'] = $userInfo;
            unset($_SESSION['user']);
            header('Location: TwoFactorAuth.php');
            exit();
        }
        header("Location: ../Dashboard/index.php");
        exit();
    } else {
        $message = "Error al iniciar sesión, verifica tu correo y contraseña.";
    }
}
include 'Views/LoginView.php';
if (!empty($message)) {
    echo '
    <script>
    message.error("' . $message . '");
    </script>';
}
?>