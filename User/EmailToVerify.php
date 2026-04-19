<?php

require_once '../includes/Remember.php';
require_once '../includes/Mail.php';
require_once '../config/encrypt.php';
require_once '../Models/UserModel.php';

$database = new Database();
try {
    $conn = $database->connect();
} catch (Exception $e) {
    die('Error en la conexión a la base de datos');
}
$user = new User($conn);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = $_POST['email'] ?? null;

    if ($email) {
        $mail = new Mail();
        $verificationCode = bin2hex(random_bytes(16));

        $user->SetVerificationToken($email, $verificationCode);

        $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
			$host = $_SERVER['HTTP_HOST'] ?? 'localhost';
			$basePath = rtrim(str_replace('\\', '/', dirname($_SERVER['PHP_SELF'])), '/');
			$resetLink = $scheme . '://' . $host . $basePath . '/VerifyEmail.php?email=' . urlencode($email) . '&token=' . urlencode($verificationCode);
        $mail = new Mail();
        $subject = "Verificación de correo electrónico";
        $body = "
            <h2>Verificación de correo electrónico</h2>
            <p>Para verificar tu correo electrónico, haz clic en el siguiente enlace:</p>
            <p><a href=\"{$resetLink}\">Verificar correo electrónico</a></p>
            <p>Este enlace expirará en 24 horas.</p>
            <p>Si no te registraste en NootraLite, puedes ignorar este mensaje.</p>
        ";
        $mail->send($email, $subject, $body);

        header('Location: Profile.php');
        exit();

    }
}

?>