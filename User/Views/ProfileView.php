<!DOCTYPE html>
<html lang="es-MX">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
    <script src="../js/includes/lightMode.js" defer></script>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../css/User/profile.css">
    <link rel="stylesheet" href="../css/includes/sidebar.css">
    <link rel="stylesheet" href="../css/includes/lightMode.css">
    <title>Perfil</title>
</head>
<body>
    <main class="main">
        <section class="principalInfo">
            <div class="imageUser">
                <div class="image"></div>
            </div>
            <div class='user'>
                <p class="full-name"><?php echo $_SESSION['user']['username']; ?></p>
                <p class="bio"><?= !empty($_SESSION['user']['bio']) ? decrypt_data($_SESSION['user']['bio']) : "Sin biografía" ?></p>
            </div>
        </section>
        <section class="userInfo">
            <header class="title"><hr class="tablet"><i data-lucide="user" class="icon-info"></i> Información del usuario<hr></header>
            <section class="user-details">
                <div class="info">
                    <p class="label">Nombre:</p>
                    <p class="data"><?php echo decrypt_data($_SESSION['user']['full_name']); ?></p>
                </div>
                <div class="info">
                    <p class="label">Correo:</p>
                    <p class="data"><?php echo $_SESSION['user']['email']; ?></p>
                </div>
                <div class="info">
                    <p class="label">País:</p>
                    <p class="data"><?= !empty($_SESSION['user']['country']) ? decrypt_data($_SESSION['user']['country']) : "No proporcionado" ?></p>
                </div>
                <div class="info">
                    <p class="label">Teléfono:</p>
                    <p class="data"><?= !empty($_SESSION['user']['phone']) ? $_SESSION['user']['phone'] : "No proporcionado" ?></p>
                </div>
                <div class="info">
                    <p class="label">Estado:</p>
                    <p class="data"><?= !empty($_SESSION['user']['city']) ? decrypt_data($_SESSION['user']['city']) : "No proporcionado" ?></p>
                </div>
            </section>
        </section>
        <section class="schoolInfo">
            <header class="title"><hr class="tablet"><i data-lucide="school" class="icon-info"></i> Información de la escuela<hr></header>
            <section class="user-details">
                <div class="info">
                    <p class="label">Escuela:</p>
                    <p class="data"><?= !empty($_SESSION['user']['school']) ? decrypt_data($_SESSION['user']['institution']) : "No proporcionado" ?></p>
                </div>
                <div class="info">
                    <p class="label">Carrera:</p>
                    <p class="data"><?= !empty($_SESSION['user']['grade']) ? decrypt_data($_SESSION['user']['carrer']) : "No proporcionado" ?></p>
                </div>
                <div class="info">
                    <p class="label">ID de estudiante:</p>
                    <p class="data"><?= !empty($_SESSION['user']['student_id']) ? decrypt_data($_SESSION['user']['student_id']) : "No proporcionado" ?></p>
                </div>
            </section>
        </section>
        <section class="useInfo">
            <header class="title"><hr class="tablet"><i data-lucide="boxes" class="icon-info"></i> Información de uso<hr></header>
            <section class="user-details">
                <p>Aun no hay información de uso disponible. Asi que pues ni modo</p>
            </section>
        </section>
        <section class="options">
            <a href="Logout.php" class="btn-logout">Cerrar sesión</a>
            <a href="EditProfile.php" class="btn-edit_profile">Modificar perfil</a>
            <a href="DeleteAccount.php" class="btn-delete_account">Eliminar cuenta</a>
        </section>
    </main>
    <script>lucide.createIcons({attrs: {'stroke-width': 1.6, stroke: 'currentColor'}});</script>
    <script src="../js/includes/sidebar.js"></script>
</body>
</html>