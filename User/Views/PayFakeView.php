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
    <link rel="stylesheet" href="../css/User/PayFake.css">
    <link rel="stylesheet" href="../css/includes/sidebar.css">
    <link rel="stylesheet" href="../css/includes/lightMode.css">
    <title>Pago</title>
</head>
<body>
    <main>
        <a href="../User/Subscriptions.php" class="cancel">Cancelar</a>
        <form action="PayFake.php" method="POST">
            <input type="hidden" name="plan" value="<?php echo htmlspecialchars((string)($plan ?? ''), ENT_QUOTES, 'UTF-8'); ?>">
            <input type="hidden" name="category" value="<?php echo htmlspecialchars((string)($category ?? ''), ENT_QUOTES, 'UTF-8'); ?>">
            <h3>Pago Falso, no se procesará ni registrara informacion delicada en la base de datos</h3>
            <p>Pago para la suscripción <span class="span"><?php echo htmlspecialchars((string)($plan ?? ''), ENT_QUOTES, 'UTF-8'); ?></span> del tipo <span class="span"><?php echo htmlspecialchars((string)($category ?? ''), ENT_QUOTES, 'UTF-8'); ?></span></p>
            <?php 
            if (($category ?? '') === 'education'): ?>
                <?php if (empty($_SESSION['user']['country']) or empty($_SESSION['user']['city']) or empty($_SESSION['user']['institution']) or empty($_SESSION['user']['student_id']) or empty($_SESSION['user']['career']) or !$_SESSION['user']['is_verified']): ?>
                    <a href="../User/EditProfile.php" class="education-note">Nota: Para la categoría debes colocar la informacion de tu escuela, pais, ciudad y estar verificado para poder disfrutar de los beneficios. haz clic aquí para completar tu perfil</a><br><br>
                <?php endif; ?>
            <?php elseif (($category ?? '') === 'enterprise'): ?>
                <?php if (empty($_SESSION['user']['country']) or empty($_SESSION['user']['city']) or !$_SESSION['user']['is_verified']): ?>
                    <a href="../User/EditProfile.php" class="education-note">Nota: Para la categoría enterprise debes colocar tu pais y ciudad y estar verificado para poder disfrutar de los beneficios. haz clic aquí para completar tu perfil</a><br><br>
                <?php endif; ?>
            <?php endif; ?>
            <div class="form-group">
                <label for="cardholderName">Nombre del titular</label>
                <input type="text" name="cardholderName" id="cardholderName" required maxlength="255" minlength="20" class="input-field">
            </div>
            <div class="form-group">
                <label for="cardNumber">Número de tarjeta (solo se guardan los últimos 4 dígitos)</label>
                <input type="number" name="cardNumber" id="cardNumber" required placeholder="1234 5678 9012 3456" maxlength="19" minlength="13" class="input-field">
            </div>
            <div class="form-group">
                <label for="expiryDate">Fecha de vencimiento (no se guardará) (MM/YY)</label>
                <input type="text" name="expiryDate" id="expiryDate" required placeholder="MM/YY" maxlength="5" minlength="5" class="input-field">
            </div>
            <div class="form-group">
                <label for="cvv">Código de seguridad (no se guardará)</label>
                <input type="number" name="cvv" id="cvv" required placeholder="CVV" maxlength="3" minlength="3" class="input-field">
            </div>
            <div class="form-group">
                <label for="address">Dirección (no se guardará)</label>
                <input type="text" name="address" id="address" required placeholder="Calle 123" maxlength="255" minlength="10" class="input-field">
            </div>
            <div class="form-group">
                <label for="cardType">Tipo de tarjeta</label>
                <select name="cardType" id="cardType" required class="input-field">
                    <option value="">Seleccionar tipo de tarjeta</option>
                    <option value="credit">Tarjeta de crédito</option>
                    <option value="debit">Tarjeta de débito</option>
                </select>
            </div>
            <?php if (($category ?? '') === 'education'): ?>
                <?php if (empty($_SESSION['user']['country']) or empty($_SESSION['user']['city']) or empty($_SESSION['user']['institution']) or empty($_SESSION['user']['student_id']) or empty($_SESSION['user']['career']) or !$_SESSION['user']['is_verified']): ?>
                    <button type="submit" class="pay-btn" disabled>Pagar</button>
                <?php else: ?>
                    <button type="submit" class="pay-btn">Pagar</button>
                <?php endif; ?>
            <?php elseif (($category ?? '') === 'enterprise'): ?>
                <?php if (empty($_SESSION['user']['country']) or empty($_SESSION['user']['city']) or !$_SESSION['user']['is_verified']): ?>
                    <button type="submit" class="pay-btn" disabled>Pagar</button>
                <?php else: ?>
                    <button type="submit" class="pay-btn">Pagar</button>
                <?php endif; ?>
            <?php else: ?>
                <button type="submit" class="pay-btn">Pagar</button>
            <?php endif; ?>
        </form>
    <script>lucide.createIcons({attrs: {'stroke-width': 1.6, stroke: 'currentColor'}});</script>
    <script src="../js/includes/sidebar.js"></script>
    </main>
</body>
</html>