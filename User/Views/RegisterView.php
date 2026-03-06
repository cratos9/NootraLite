<!DOCTYPE html>
<html lang="es-MX">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
    <link rel="stylesheet" href="../css/User/Register.css">
    <title>Registro</title>
</head>
<body>
    <span class="bg-decoration bg-decoration_1"></span>
    <span class="bg-decoration bg-decoration_2"></span>
    <script src="https://unpkg.com/lucide@latest"></script>
    
    <i data-lucide="sun" class="icon-sun"></i>

    <div class="bg-decoration bg-decoration_1"></div>
    <div class="bg-decoration bg-decoration_2"></div>

    <?php if ($mensaje): ?>
        <p><?= htmlspecialchars($mensaje) ?></p>
        <?php endif; ?>
        
        <div class="container">
            <i data-lucide="user" class="icon icon-purple"></i>
            <h1>Registrate</h1>
            
            <form method="POST">
                <div class="group-input">
                    <label for="fullname">Nombre completo</label>
                    <input type="text" id="fullname" name="fullname" required>
                </div>
                
                <div class="group-input">
                    <label for="email">Correo</label>
                    <input type="email" id="email" name="email" required>
                </div>
                
                <div class="group-input">
                    <label for="password">Contraseña</label>
                    <input type="password" id="password" name="password" required>
                </div>

                <div class="group-input">
                <label for="username">Nombre de usuario</label>
                <input type="text" id="username" name="username" required>
            </div>
            
            <button type="submit" id="register-btn" >Registrarse</button>
        </form>

        <div class="divider">
            <span>O CONTINUA CON</span>
        </div>

        <div id="google">
            <i data-lucide="chromium" class="icon-links"></i>
            <span>Google</span>
        </div>
        <div id="github">
            <i data-lucide="github" class="icon-links"></i>
            <span>GitHub</span>
        </div>

        <div class="link-container"><a href="Login.php" id='link'>Ya tienes cuenta? Iniciar sesión</a></div>
    </div>
    <script>lucide.createIcons({attrs: {'stroke-width': 1.6,stroke: 'currentColor'}});</script>
</body>
</html>