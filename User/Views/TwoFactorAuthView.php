<!DOCTYPE html>
<html lang="es-MX">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
    <script src="https://unpkg.com/html5-qrcode"></script>
    <script src="../js/includes/lightMode.js" defer></script>
    <script src="../js/includes/toast.js"></script>
    <link rel="stylesheet" href="../css/includes/toast.css">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../css/User/TwoFactorAuth.css">
    <link rel="stylesheet" href="../css/includes/lightMode.css">
    <title>Autenticacion de dos pasos</title>
</head>
<body>
    <main>
        <h1>Autenticación de dos pasos</h1>
        <p>Abre el correo en otro dispositivo y apunta la cámara al código QR para validar el acceso.</p>
        <?php if (!empty($_SESSION['two_factor_error'])): ?>
            <p class="qr-fallback"><?php echo htmlspecialchars($_SESSION['two_factor_error'], ENT_QUOTES, 'UTF-8'); ?></p>
        <?php endif; ?>
        <div id="cam" class="cam"></div>
        <p class="scan-status">Esperando lectura del código QR...</p>
        
        <div class="token-section">
            <h3>Alternativa: Ingresa el código de 8 dígitos</h3>
            <form id="token-form">
                <input type="text" id="token-input" name="token" placeholder="00000000" maxlength="8" pattern="[0-9]{8}" inputmode="numeric"required>
                <button type="submit">Verificar</button>
            </form>
            <p class="token-hint">El código que recibiste por correo de 8 dígitos.</p>
        </div>
    </main>
    <script>lucide.createIcons({attrs: {'stroke-width': 1.6, stroke: 'currentColor'}});</script>
    <script src="../js/includes/sidebar.js"></script>
    <script src="../js/User/TwoFactorAuth.js"></script>
</body>
</html>