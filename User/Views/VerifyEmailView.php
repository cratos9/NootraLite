<!DOCTYPE html>
<html lang="es-MX">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
    <script src="../js/includes/lightMode.js" defer></script>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../css/User/VerifyEmail.css">
    <link rel="stylesheet" href="../css/includes/lightMode.css">

    <title>Verificación de Correo</title>
</head>
<body>
    <main>
        <h1>Verificación de Correo</h1>
        <p><?php echo $userVerified; ?></p>
        <a href="Login.php">Iniciar sesión</a>
        <script>lucide.createIcons({attrs: {'stroke-width': 1.6, stroke: 'currentColor'}});</script>
        <script src="../js/includes/sidebar.js"></script>
    </main>
</body>
</html>