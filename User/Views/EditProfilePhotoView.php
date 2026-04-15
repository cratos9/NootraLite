<!DOCTYPE html>
<html lang="es-MX">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
    <script src="../js/includes/lightMode.js" defer></script>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../css/includes/sidebar.css">
    <link rel="stylesheet" href="../css/includes/lightMode.css">
    <link rel="stylesheet" href="../css/User/EditProfilePhoto.css">
    <title>Editar Foto de Perfil</title>
</head>
<body>
     <main>
        <a href="Profile.php" class="btn-cancel">Cancelar</a>
        
        <?php if (!empty($message)): ?>
            <div class="message <?php echo $messageType; ?>">
                <?php echo htmlspecialchars($message); ?>
            </div>
        <?php endif; ?>
        
        <div class="image-container">
            <?php 
                $isDefault = ($getPhoto === 'default.png' || empty($getPhoto));
                if ($isDefault): 
            ?>
                <img src="../files/images/default.png" alt="Foto de perfil" id="photo" class="profile-photo">
            <?php else: ?>
                <img src="../files/images/<?php echo htmlspecialchars($getPhoto); ?>" alt="Foto de perfil" id="photo" class="profile-photo">
            <?php endif; ?>
        </div>
        
        <form action="EditProfilePhoto.php" method="POST" enctype="multipart/form-data" id="photoForm">
            <div class="input-form">
                <label for="photo-input">Sube la imagen:</label>
                <input type="file" name="photo" id="photo-input" class="form-control" placeholder="Foto" accept="image/jpeg,image/png" required>
            </div>
            <br>
            <button type="submit" name="edit_photo" class="btn-edit_profile">Subir</button>
        </form>
    </main>
    <script>lucide.createIcons({attrs: {'stroke-width': 1.6, stroke: 'currentColor'}});</script>
    <script src="../js/includes/sidebar.js"></script>
    <script src="../js/User/EditProfilePhoto.js"></script>
</body>
</html>