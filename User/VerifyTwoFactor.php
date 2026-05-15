<?php

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

header('Content-Type: application/json; charset=UTF-8');

$pendingUser = $_SESSION['pending_2fa_user'] ?? null;
$expectedChallenge = $_SESSION['two_factor_challenge'] ?? null;
$expectedToken = $_SESSION['two_factor_token_numeric'] ?? null;
$expectedExpiry = $_SESSION['two_factor_challenge_expires_at'] ?? 0;

$scannedQrData = $_POST['qr_data'] ?? '';
$ingressedToken = $_POST['token'] ?? '';

if (empty($pendingUser['id'])) {
    echo json_encode([
        'ok' => false,
        'message' => 'No hay una verificación de dos pasos pendiente.'
    ]);
    exit;
}

if ($expectedExpiry < time()) {
    unset($_SESSION['two_factor_challenge'], $_SESSION['two_factor_challenge_expires_at'], $_SESSION['two_factor_token_numeric']);
    echo json_encode([
        'ok' => false,
        'message' => 'El código de verificación expiró. Vuelve a iniciar sesión.'
    ]);
    exit;
}

$isValid = false;

if (!empty($scannedQrData) && !empty($expectedChallenge)) {
    if (hash_equals($expectedChallenge, $scannedQrData)) {
        $isValid = true;
    } else {
        echo json_encode([
            'ok' => false,
            'message' => 'El código QR escaneado no coincide.'
        ]);
        exit;
    }
}
elseif (!empty($ingressedToken) && !empty($expectedToken)) {
    if (hash_equals($expectedToken, $ingressedToken)) {
        $isValid = true;
    } else {
        echo json_encode([
            'ok' => false,
            'message' => 'El código de 8 dígitos no coincide.'
        ]);
        exit;
    }
}
else {
    echo json_encode([
        'ok' => false,
        'message' => 'Debes proporcionar un código QR o un token válido.'
    ]);
    exit;
}

if ($isValid) {
    session_regenerate_id(true);
    $_SESSION['user'] = $pendingUser;
    unset($_SESSION['pending_2fa_user'], $_SESSION['two_factor_challenge'], $_SESSION['two_factor_challenge_expires_at'], $_SESSION['two_factor_token_numeric']);

    echo json_encode([
        'ok' => true,
        'redirect' => '../Dashboard/index.php'
    ]);
    exit;
}

echo json_encode([
    'ok' => false,
    'message' => 'Verificación fallida. Intenta nuevamente.'
]);