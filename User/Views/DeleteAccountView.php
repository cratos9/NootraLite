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
    <link rel="stylesheet" href="../css/User/DeleteAccount.css">
    <link rel="stylesheet" href="../css/includes/sidebar.css">
    <link rel="stylesheet" href="../css/includes/lightMode.css">
    <title>Eliminar Cuenta</title>
</head>
<body>
    <main>
        <a href="Profile.php" class="btn-cancel">No, volver a mi perfil</a>
        <h1>¿Estás seguro de que deseas eliminar tu cuenta?</h1>
        <p>Esta acción es <span>irreversible</span>. Todos tus datos serán <span>eliminados permanentemente</span>.</p>
        <form action="DeleteAccount.php" method="POST">
            <label for="confirm_delete">Confirmar eliminación:</label>
            <input type="password" name="password" id="password" placeholder="Ingresa tu contraseña para confirmar" required>
            <button type="submit" name="confirm_delete" class="btn-delete">Sí, eliminar mi cuenta</button>
        </form>
    <script>lucide.createIcons({attrs: {'stroke-width': 1.6, stroke: 'currentColor'}});</script>
    <script src="../js/includes/sidebar.js"></script>
    </main>
</body>
</html>