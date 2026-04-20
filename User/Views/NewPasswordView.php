<?php
$errors = $errors ?? [];
$isSuccess = $isSuccess ?? false;
$tokenInvalid = $tokenInvalid ?? false;
$userId = $userId ?? 0;
$token = $token ?? '';
?>
<!DOCTYPE html>
<html lang="es-MX">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
    <script src="../js/User/Auth.js" defer></script>
    <script src="../js/includes/toast.js"></script>
    <link rel="stylesheet" href="../css/includes/toast.css">
    <link rel="stylesheet" href="../css/User/Auth.css">
    <title>Nueva contraseña</title>
</head>
<body>

    <i data-lucide="sun" class="icon-sun" id="icon-sun"></i>
    <i data-lucide="moon" class="icon-sun hidden" id="icon-moon"></i>

    <div class="bg-decoration bg-decoration_1"></div>
    <div class="bg-decoration bg-decoration_2"></div>
    <div class="bg-decoration bg-decoration_1"></div>
    <div class="bg-decoration bg-decoration_2"></div>

    <div class="container">
        <i data-lucide="key-round" class="icon icon-purple"></i>
        <h1>Nueva contraseña</h1>

        <?php if (!$tokenInvalid && !$isSuccess): ?>
            <form method="POST">
                <input type="hidden" name="uid" value="<?= (int) $userId ?>">
                <input type="hidden" name="token" value="<?= htmlspecialchars($token, ENT_QUOTES, 'UTF-8') ?>">

                <div class="group-input password-group">
                    <label for="password" class="label-input">Contraseña nueva</label>
                    <input type="password" id="password" name="password" required class="input" minlength="8" maxlength="72">
                    <i data-lucide="eye" class="icon-links password-toggle" id="show-password" aria-label="Mostrar contraseña" title="Mostrar contraseña"></i>
                    <i data-lucide="eye-off" class="icon-links password-toggle hidden" id="hide-password" aria-label="Ocultar contrasena" title="Ocultar contrasena"></i>
                </div>

                <div class="group-input">
                    <label for="confirm_password" class="label-input">Confirmar contraseña</label>
                    <input type="password" id="confirm_password" name="confirm_password" required class="input" minlength="8" maxlength="72">
                </div>

                <button type="submit" id="register-btn">Actualizar contraseña</button>
            </form>
        <?php endif; ?>

        <?php if ($tokenInvalid): ?>
            <div class="link-container"><a href="ForgotPassword.php" id="link">Solicitar nuevo enlace</a></div>
        <?php endif; ?>

        <?php if ($isSuccess): ?>
            <div class="link-container"><a href="Login.php" id="link">Ir a iniciar sesion</a></div>
        <?php endif; ?>
    </div>

    <script>lucide.createIcons({attrs: {'stroke-width': 1.6, stroke: 'currentColor'}});</script>
</body>
</html>