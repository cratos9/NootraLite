<?php
$errors = $errors ?? [];
$oldInput = $oldInput ?? [];

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
    <link rel="stylesheet" href="../css/User/Auth.css">
    <title>Registro</title>
</head>
<body>
    
    <i data-lucide="sun" class="icon-sun" id="icon-sun"></i>
    <i data-lucide="moon" class="icon-sun hidden" id="icon-moon"></i>

    <div class="bg-decoration bg-decoration_1"></div>
    <div class="bg-decoration bg-decoration_2"></div>
    <div class="bg-decoration bg-decoration_1"></div>
    <div class="bg-decoration bg-decoration_2"></div>

    <?php if ($mensaje): ?>
        <p class="error"><?= htmlspecialchars($mensaje) ?></p>
        <?php endif; ?>
        
        <div class="container">
            <i data-lucide="user" class="icon icon-purple"></i>
            <h1>Registrate</h1>
            
            <form method="POST">
                <div class="group-input">
                    <label for="fullname" class="label-input">Nombre completo</label>
                    <input type="text" id="fullname" name="fullname" value="<?= $value('fullname') ?>" required class="input" minlength="3" maxlength="80">
                    <?php if (!empty($errors['fullname'])): ?><small class="field-error"><?= htmlspecialchars($errors['fullname'], ENT_QUOTES, 'UTF-8') ?></small><?php endif; ?>
                </div>
                
                <div class="group-input">
                    <label for="username" class="label-input">Nombre de usuario</label>
                    <input type="text" id="username" name="username" value="<?= $value('username') ?>" required class="input" pattern="[a-zA-Z0-9._]{3,30}" minlength="3" maxlength="30">
                    <?php if (!empty($errors['username'])): ?><small class="field-error"><?= htmlspecialchars($errors['username'], ENT_QUOTES, 'UTF-8') ?></small><?php endif; ?>
                </div>
                
                <div class="group-input">
                    <label for="email" class="label-input">Correo</label>
                    <input type="email" id="email" name="email" value="<?= $value('email') ?>" required class="input" maxlength="120">
                    <?php if (!empty($errors['email'])): ?><small class="field-error"><?= htmlspecialchars($errors['email'], ENT_QUOTES, 'UTF-8') ?></small><?php endif; ?>
                </div>
                
                <div class="group-input" >
                    <label for="password" class="label-input">Contraseña</label>
                    <input type="password" id="password" name="password" required class="input" minlength="8" maxlength="72">
                    <?php if (!empty($errors['password'])): ?><small class="field-error"><?= htmlspecialchars($errors['password'], ENT_QUOTES, 'UTF-8') ?></small><?php endif; ?>
                </div>

                <div class="group-input">
                    <label for="confirm_password" class="label-input">Confirmar contraseña</label>
                    <input type="password" id="confirm_password" name="confirm_password" required class="input" minlength="8" maxlength="72">
                    <?php if (!empty($errors['confirm_password'])): ?><small class="field-error"><?= htmlspecialchars($errors['confirm_password'], ENT_QUOTES, 'UTF-8') ?></small><?php endif; ?>
                </div>
            
            <button type="submit" id="register-btn" >Registrarse</button>
        </form>

        <div class="divider">
            <span>O CONTINUA CON</span>
        </div>

        <div id="google">
            <i data-lucide="at-sign" class="icon-links"></i>
            <span>Google</span>
        </div>
        <div id="github">
            <i data-lucide="git-compare-arrows" class="icon-links"></i>
            <span>GitHub</span>
        </div>

        <div class="link-container"><a href="Login.php" id='link'>Ya tienes cuenta? Iniciar sesión</a></div>
    </div>
        <script>lucide.createIcons({attrs: {'stroke-width': 1.6, stroke: 'currentColor'}});</script>
</body>
</html>