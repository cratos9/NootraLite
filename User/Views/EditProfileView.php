<?php
$errors = $errors ?? [];
$oldInput = $oldInput ?? [];

$value = static function (string $key, string $default = '') use ($oldInput): string {
    $raw = $oldInput[$key] ?? $default;
    return htmlspecialchars((string) $raw, ENT_QUOTES, 'UTF-8');
};
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
    <script src="../js/includes/lightMode.js" defer></script>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../css/includes/sidebar.css">
    <link rel="stylesheet" href="../css/includes/lightMode.css">
    <link rel="stylesheet" href="../css/User/EditProfile.css">
    <title>Editar Perfil</title>
</head>
<body>
    <main>
        <a href="Profile.php" class="btn-cancel" >Cancelar</a><br><br>
        <h1>Editar Perfil</h1>
        <?php if (!empty($errors['general'])): ?>
            <p class="form-message error-message"><?= htmlspecialchars($errors['general'], ENT_QUOTES, 'UTF-8') ?></p>
        <?php endif; ?>
        <form method="POST" class="edit-profile-form">
            <section class="userInfo">
                <header class="title"><hr class="tablet"><i data-lucide="user" class="icon-info"></i> Información del usuario<hr></header>
                <a href="#" class="btn-edit_profilePicture">Modificar foto de perfil</a>
                <div class="form-group">
                    <label for="username">Nombre de usuario:</label>
                    <input type="text" id="username" name="username" value="<?= $value('username') ?>" class="input-field" pattern="[a-zA-Z0-9._]{3,30}" minlength="3" maxlength="30" required>
                    <?php if (!empty($errors['username'])): ?><small class="field-error"><?= htmlspecialchars($errors['username'], ENT_QUOTES, 'UTF-8') ?></small><?php endif; ?>
                </div>
                <div class="form-group">
                    <label for="bio">Biografía:</label>
                    <textarea id="bio" name="bio" rows="4" class="input-field" maxlength="300"><?= $value('bio') ?></textarea>
                    <?php if (!empty($errors['bio'])): ?><small class="field-error"><?= htmlspecialchars($errors['bio'], ENT_QUOTES, 'UTF-8') ?></small><?php endif; ?>
                </div>
                <div class="form-group">
                    <label for="full_name">Nombre completo:</label>
                    <input type="text" id="full_name" name="full_name" value="<?= $value('full_name') ?>" class="input-field" minlength="3" maxlength="80" required>
                    <?php if (!empty($errors['full_name'])): ?><small class="field-error"><?= htmlspecialchars($errors['full_name'], ENT_QUOTES, 'UTF-8') ?></small><?php endif; ?>
                </div>
                <div class="form-group">
                    <label for="email">Correo electrónico:</label>
                    <input type="email" id="email" name="email" value="<?= $value('email') ?>" class="input-field" maxlength="120" required>
                    <?php if (!empty($errors['email'])): ?><small class="field-error"><?= htmlspecialchars($errors['email'], ENT_QUOTES, 'UTF-8') ?></small><?php endif; ?>
                </div>
                <div class="form-group">
                    <label for="phone">Teléfono:</label>
                    <input type="text" id="phone" name="phone" value="<?= $value('phone') ?>" class="input-field" pattern="[0-9+()\- ]{7,20}" maxlength="20">
                    <?php if (!empty($errors['phone'])): ?><small class="field-error"><?= htmlspecialchars($errors['phone'], ENT_QUOTES, 'UTF-8') ?></small><?php endif; ?>
                </div>
                <div class="form-group">
                    <label for="country">País:</label>
                    <input type="text" id="country" name="country" value="<?= $value('country') ?>" class="input-field" maxlength="80">
                    <?php if (!empty($errors['country'])): ?><small class="field-error"><?= htmlspecialchars($errors['country'], ENT_QUOTES, 'UTF-8') ?></small><?php endif; ?>
                </div>
                <div class="form-group">
                    <label for="city">Estado:</label>
                    <input type="text" id="city" name="city" value="<?= $value('city') ?>" class="input-field" maxlength="80">
                    <?php if (!empty($errors['city'])): ?><small class="field-error"><?= htmlspecialchars($errors['city'], ENT_QUOTES, 'UTF-8') ?></small><?php endif; ?>
                </div>
            </section>
            <section class="schoolInfo">
                <header class="title"><hr class="tablet"><i data-lucide="school" class="icon-info"></i> Información de la escuela<hr></header>
                <div class="form-group">
                    <label for="institution">Escuela:</label>
                    <input type="text" id="institution" name="institution" value="<?= $value('institution') ?>" class="input-field" maxlength="120">
                    <?php if (!empty($errors['institution'])): ?><small class="field-error"><?= htmlspecialchars($errors['institution'], ENT_QUOTES, 'UTF-8') ?></small><?php endif; ?>
                </div>
                <div class="form-group">
                    <label for="carrer">Carrera:</label>
                    <input type="text" id="carrer" name="carrer" value="<?= $value('carrer') ?>" class="input-field" maxlength="120">
                    <?php if (!empty($errors['carrer'])): ?><small class="field-error"><?= htmlspecialchars($errors['carrer'], ENT_QUOTES, 'UTF-8') ?></small><?php endif; ?>
                </div>
                <div class="form-group">
                    <label for="student_id">ID de estudiante:</label>
                    <input type="text" id="student_id" name="student_id" value="<?= $value('student_id') ?>" class="input-field" pattern="[a-zA-Z0-9\-_.]{3,40}" maxlength="40">
                    <?php if (!empty($errors['student_id'])): ?><small class="field-error"><?= htmlspecialchars($errors['student_id'], ENT_QUOTES, 'UTF-8') ?></small><?php endif; ?>
                </div>
            </section>
            <br>
            <button type="submit" class="btn-edit_profile">Guardar cambios</button>
            <br><br class="mobile">
        </form>
    </main>
    <script>lucide.createIcons({attrs: {'stroke-width': 1.6, stroke: 'currentColor'}});</script>
    <script src="../js/includes/sidebar.js"></script>
</body>
</html>