<?php
$errors = $errors ?? [];
$oldInput = $oldInput ?? [];
$isSuccess = $isSuccess ?? false;

$value = static function (string $key) use ($oldInput): string {
    return htmlspecialchars((string) ($oldInput[$key] ?? ''), ENT_QUOTES, 'UTF-8');
};
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
    <title>Recuperar contraseña</title>
</head>
<body>

    <i data-lucide="sun" class="icon-sun" id="icon-sun"></i>
    <i data-lucide="moon" class="icon-sun hidden" id="icon-moon"></i>

    <div class="bg-decoration bg-decoration_1"></div>
    <div class="bg-decoration bg-decoration_2"></div>
    <div class="bg-decoration bg-decoration_1"></div>
    <div class="bg-decoration bg-decoration_2"></div>

    <div class="container">
        <i data-lucide="mail" class="icon icon-purple"></i>
        <h1>Recuperar contraseña</h1>

        <form method="POST">
            <div class="group-input">
                <label for="email" class="label-input">Correo</label>
                <input type="email" id="email" name="email" value="<?= $value('email') ?>" required class="input" maxlength="120">
            </div>

            <button type="submit" id="register-btn">Enviar enlace</button>
        </form>

        <div class="link-container"><a href="Login.php" id="link">Volver a inicio de sesion</a></div>
    </div>

    <script>lucide.createIcons({attrs: {'stroke-width': 1.6, stroke: 'currentColor'}});</script>
</body>
</html>