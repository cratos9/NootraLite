<?php
require_once '../Models/UserModel.php';
require_once '../config/db.php';
require_once '../includes/Mail.php';

$database = new Database();

try {
	$conn = $database->connect();
} catch (Exception $e) {
	die('Error en la conexion a la base de datos');
}

$user = new User($conn);

$message = "";
$messageType = "";
$isSuccess = false;
$oldInput = [
	'email' => '',
];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
	$email = strtolower(trim($_POST['email'] ?? ''));
	$oldInput['email'] = $email;

	if ($email === '') {
		$message = 'El correo es obligatorio.';
		$messageType = 'error';
	} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
		$message = 'El formato del correo es invalido.';
		$messageType = 'error';
	} elseif (strlen($email) > 120) {
		$message = 'El correo no puede exceder 120 caracteres.';
		$messageType = 'error';
	}

	if (empty($errors)) {
		$tokenData = $user->GetTokenForgotPassword($email);

		if ($tokenData) {
			$scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
			$host = $_SERVER['HTTP_HOST'] ?? 'localhost';
			$basePath = rtrim(str_replace('\\', '/', dirname($_SERVER['PHP_SELF'])), '/');
			$resetLink = $scheme . '://' . $host . $basePath . '/NewPassword.php?uid=' . urlencode((string) $tokenData['user_id']) . '&token=' . urlencode($tokenData['token']);

			$mail = new Mail();
			$subject = 'Recuperacion de contrasena - NootraLite';
			$body = "
				<h2>Recuperacion de contrasena</h2>
				<p>Recibimos una solicitud para restablecer tu contrasena en NootraLite.</p>
				<p>Da clic en el siguiente enlace para crear una nueva contrasena:</p>
				<p><a href=\"{$resetLink}\">Restablecer contrasena</a></p>
				<p>Este enlace expirara en 1 hora.</p>
				<p>Si no hiciste esta solicitud, puedes ignorar este mensaje.</p>
			";

			$sendResult = $mail->send($email, $subject, $body);
			if ($sendResult !== true) {
				$message = 'No se pudo enviar el correo de recuperacion. Intentalo mas tarde.';
				$messageType = 'error';
			} else {
				$isSuccess = true;
				$message = 'Te enviamos un enlace de recuperacion.';
				$messageType = 'tip';
			}
		} else {
			$isSuccess = true;
			$message = 'Te enviamos un enlace de recuperacion.';
			$messageType = 'tip';
		}
	}
}

include 'Views/ForgotPasswordView.php';
if ($message) {
	echo '
	<script>
	message.' . $messageType . '("' . $message . '");
	</script>';
}
?>