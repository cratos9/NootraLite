<!DOCTYPE html>
<html lang="es-MX">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
    <script src="../js/includes/lightMode.js" defer></script>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../css/includes/sidebar.css">
    <link rel="stylesheet" href="../css/dashboard/index.css">
    <link rel="stylesheet" href="../css/includes/lightMode.css">
    <title>Dashboard</title>
</head>
<body>
    <main class="main">
        <p>Bienvenido al Dashboard, <?php echo decrypt_data($_SESSION['user']['full_name']); ?>!</p>
        <p>Email: <?php echo $_SESSION['user']['email']; ?></p>
        <p>Username: <?php echo $_SESSION['user']['username']; ?></p>
        <p>ID: <?php echo $_SESSION['user']['id']; ?></p>
        <p>Last Login: <?php echo $_SESSION['user']['last_login']; ?></p>
    </main>
    <script>lucide.createIcons({attrs: {'stroke-width': 1.6, stroke: 'currentColor'}});</script>
    <script src="../js/includes/sidebar.js"></script>
</body>
</html>