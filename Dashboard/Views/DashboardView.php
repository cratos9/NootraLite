<!DOCTYPE html>
<html lang="es-MX">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <p>Bienvenido al Dashboard, <?php echo decrypt_data($_SESSION['user']['full_name']); ?>!</p>
    <p>Email: <?php echo $_SESSION['user']['email']; ?></p>
    <p>Username: <?php echo $_SESSION['user']['username']; ?></p>
    <p>ID: <?php echo $_SESSION['user']['id']; ?></p>
    <p>Last Login: <?php echo $_SESSION['user']['last_login']; ?></p>
</body>
</html>