<?php include '../includes/sidebar.php'; ?>
<!DOCTYPE html>
<html lang="es-MX">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
    <script src="../js/includes/lightMode.js" defer></script>
    <script src="../js/includes/toast.js"></script>
    <link rel="stylesheet" href="../css/includes/toast.css">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../css/User/EditPassword.css">
    <link rel="stylesheet" href="../css/includes/sidebar.css">
    <link rel="stylesheet" href="../css/includes/lightMode.css">
    <title>Editar Contraseña</title>
</head>
<body>
    <main>
        <a href="Profile.php" class="btn-cancel">Cancelar</a>
        <form action="EditPassword.php" method="POST">
            <label for="password">Contraseña actual:</label>
            <input type="password" name="password" class="password" placeholder="Ingresa tu contraseña para confirmar" value="<?php echo htmlspecialchars($_POST['password'] ?? ''); ?>">

            <label for="new_password">Nueva contraseña:</label>
            <input type="password" name="new_password" class="password" placeholder="Ingresa tu nueva contraseña" value="<?php echo htmlspecialchars($_POST['new_password'] ?? ''); ?>">

            <label for="confirm_new_password">Confirmar nueva contraseña:</label>
            <input type="password" name="confirm_new_password" class="password" placeholder="Confirma tu nueva contraseña" value="<?php echo htmlspecialchars($_POST['confirm_new_password'] ?? ''); ?>">

            <button type="submit" name="confirm_delete" class="btn-change">Cambiar Contraseña</button>
        </form>
    <script>lucide.createIcons({attrs: {'stroke-width': 1.6, stroke: 'currentColor'}});</script>
    <script src="../js/includes/sidebar.js"></script>
    </main>
</body>
</html>