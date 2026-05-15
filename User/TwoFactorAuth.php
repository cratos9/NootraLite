<?php

require_once '../Models/UserModel.php';
require_once '../includes/lightMode.php';
require_once '../includes/Mail.php';
require_once '../phpqrcode-2010100721_1.1.4/phpqrcode/qrlib.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (empty($_SESSION['user']['id'])) {
    $pendingUser = $_SESSION['pending_2fa_user'] ?? null;
} else {
    $pendingUser = $_SESSION['user'];
}

if (empty($pendingUser['id'])) {
    header('Location: Login.php');
    exit;
}

try {
    $database = new Database();
    $conn = $database->connect();
} catch (Exception $e) {
    die('Error en la conexión a la base de datos');
}

$user = new User($conn);

if (empty($_SESSION['two_factor_challenge']) || ($_SESSION['two_factor_challenge_expires_at'] ?? 0) < time()) {
    $challengeToken = bin2hex(random_bytes(16));
    $challengePayload = 'NootraLite-2FA:' . $challengeToken;
    $challengeExpiresAt = time() + 300;
    $tokenNumerico = str_pad(random_int(0, 99999999), 8, '0', STR_PAD_LEFT);

    $_SESSION['two_factor_challenge'] = $challengePayload;
    $_SESSION['two_factor_challenge_expires_at'] = $challengeExpiresAt;
    $_SESSION['two_factor_token_numeric'] = $tokenNumerico;

    $issuer = 'NootraLite';
    $accountLabel = $pendingUser['email'] ?? 'usuario';
    $otpUri = $challengePayload;
    $qrMatrix = QRencode::factory(QR_ECLEVEL_M, 4, 2)->encode($otpUri);

    $qrHtml = '<table cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;background:#fff;padding:16px;">';
    foreach ($qrMatrix as $row) {
        $qrHtml .= '<tr>';
        foreach (str_split($row) as $bit) {
            $color = $bit === '1' ? '#111111' : '#ffffff';
            $qrHtml .= '<td style="width:6px;height:6px;background-color:' . $color . ';padding:0;margin:0;"></td>';
        }
        $qrHtml .= '</tr>';
    }
    $qrHtml .= '</table>';

    $mail = new Mail();
    $subject = 'NootraLite - Código de verificación de dos pasos';
    $body = '<div style="font-family:Arial,sans-serif;color:#111;line-height:1.5">'
        . '<h2 style="margin:0 0 12px;">Verificación de dos pasos</h2>'
        . '<p>Abre este correo en tu teléfono o en otro dispositivo y muestra el código QR en la pantalla para escanearlo desde la página de verificación.</p>'
        . '<div style="margin:24px 0;">' . $qrHtml . '</div>'
        . '<hr style="margin:24px 0;border:none;border-top:1px solid #ddd;">'
        . '<h3 style="margin:12px 0;">Alternativa: Código de 8 dígitos</h3>'
        . '<p style="font-size:16px;font-weight:bold;font-family:Consolas,monospace;letter-spacing:4px;background:#f4f4f4;padding:16px;border-radius:8px;text-align:center;">' . htmlspecialchars($tokenNumerico, ENT_QUOTES, 'UTF-8') . '</p>'
        . '<p style="font-size:13px;color:#666;">Ingresa este código en la pantalla de verificación si la cámara no funciona.</p>'
        . '<hr style="margin:24px 0;border:none;border-top:1px solid #ddd;">'
        . '<p style="font-size:13px;color:#666;">Este código expira en 5 minutos.</p>'
        . '</div>';

    $emailResult = $mail->send($pendingUser['email'], $subject, $body);
    if ($emailResult !== true) {
        $_SESSION['two_factor_error'] = is_string($emailResult) ? $emailResult : 'No se pudo enviar el correo de verificación.';
    } else {
        unset($_SESSION['two_factor_error']);
    }
}

include 'Views/TwoFactorAuthView.php';

?>