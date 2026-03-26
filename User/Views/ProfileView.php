<!DOCTYPE html>
<html lang="es-MX">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../css/User/profile.css">
    <link rel="stylesheet" href="../css/includes/sidebar.css">
    <title>Perfil</title>
</head>
<body>
    <main>
        <section class="principalInfo">
            <div class="imageUser">
                <div class="image"></div>
                <p>Cambiar foto de perfil</p>
            </div>
            <div class='user'>
                <p class="full-name"><?php echo decrypt_data($_SESSION['user']['full_name']); ?> <i data-lucide="pencil"></i></p>
                <p class="bio"><?= !empty($_SESSION['user']['bio']) ? $_SESSION['user']['bio'] : "Sin biografía" ?> <i data-lucide="pencil"></i></p>
            </div>
        </section>
        <section class="userInfo"><i data-lucide="user"></i></section>
        <section class="schoolInfo"><i data-lucide="school"></i></section>
        <section class="useInfo"><i data-lucide="boxes"></i></section>
    </main>
    <script>lucide.createIcons({attrs: {'stroke-width': 1.6, stroke: 'currentColor'}});</script>
</body>
</html>