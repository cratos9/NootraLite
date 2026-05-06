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
    <link rel="icon" type="image/x-icon" href="favicon.ico">
    <link rel="stylesheet" href="../css/Attachments/Attachment.css">
    <link rel="stylesheet" href="../css/includes/sidebar.css">
    <link rel="stylesheet" href="../css/includes/lightMode.css">
    <title>Nuevo Adjunto</title>
</head>
<body>
    <main>
        <a href="<?= $bookId > 0 ? '../Books/Book.php?id=' . htmlspecialchars($bookId) : '../Books/Books.php' ?>" class="btn-cancel">Cancelar</a>

        <section class="upload-card">
            <div class="upload-header">
                <div class="upload-icon">
                    <i data-lucide="file-up"></i>
                </div>
                <div>
                    <p class="eyebrow">Nuevo archivo adjunto</p>
                    <h1>Sube un archivo al libro</h1>
                    <p class="subtitle">Se admiten imágenes, PDF y documentos de Word de hasta 5 MB.</p>
                </div>
            </div>

            <?php if (empty($bookData)): ?>
                <p class="verification-warning">No se encontró el libro o no tienes acceso a él.</p>
            <?php elseif (!$IsVerified): ?>
                <p class="verification-warning">Tu cuenta no está verificada. No puedes agregar archivos adjuntos.</p>
            <?php else: ?>
                <div class="book-chip">
                    <?= htmlspecialchars(decrypt_data($bookData['title'])) ?>
                </div>

                <form action="NewAttachment.php?book_id=<?= htmlspecialchars($bookId) ?>" method="POST" enctype="multipart/form-data" id="attachmentForm">
                    <input type="hidden" name="book_id" value="<?= htmlspecialchars($bookId) ?>">

                    <div class="input-form">
                        <label for="attachment-input">Selecciona el archivo</label>
                        <input type="file" name="attachment" id="attachment-input" class="form-control" accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,image/jpeg,image/png,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" required>
                        <p class="file-help">Formatos permitidos: JPG, PNG, PDF, DOC y DOCX.</p>
                    </div>

                    <button type="submit" name="upload_attachment" class="btn-edit_attachment">Subir archivo</button>
                </form>
            <?php endif; ?>
        </section>
        <script>lucide.createIcons({attrs: {'stroke-width': 1.6, stroke: 'currentColor'}});</script>
        <script src="../js/includes/sidebar.js"></script>
    </main>
</body>
</html>