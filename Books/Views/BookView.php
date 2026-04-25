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
    <link rel="stylesheet" href="../css/Books/Book.css">
    <link rel="stylesheet" href="../css/includes/sidebar.css">
    <link rel="stylesheet" href="../css/includes/lightMode.css">
    <title>Document</title>
</head>
<body>
    <main>
        <section class="book-info" style="border-color: <?= htmlspecialchars($bookData['color'] ?? '#000') ?>">
            <a href="../Books/Books.php" class="back">Regresar</a>
            <h3 class="book-title">
                <i data-lucide="book-open" class="icon-book" style="color: <?= htmlspecialchars($bookData['color'] ?? '#000000') ?>"></i>
                <?= htmlspecialchars(isset($bookData['title']) ? decrypt_data($bookData['title']) : 'Libro no encontrado') ?>
            </h3>
            <h1><?= htmlspecialchars(isset($bookData['title']) ? decrypt_data($bookData['title']) : 'Libro no encontrado') ?></h1>
            <p><?= htmlspecialchars(isset($bookData['description']) ? decrypt_data($bookData['description']) : 'Sin descripción') ?></p>
            <p>Categoría: <?= htmlspecialchars(isset($bookData['category']) ? decrypt_data($bookData['category']) : 'Sin categoría') ?></p>
            <?php if (!empty(htmlspecialchars($bookData['semester']))): ?>
                <p>Semestre: <?= htmlspecialchars($bookData['semester'] ?? 'Sin semestre') ?></p>
            <?php endif; ?>
            <p>Etiquetas: <?= htmlspecialchars(isset($bookData['tags']) ? decrypt_data($bookData['tags']) : 'Sin etiquetas') ?></p>
            <div class="options">
                <a href="../Books/EditBook.php?id=<?= htmlspecialchars($bookData['id'] ?? '') ?>" class="edit-book">Editar</a>
                <a href="../Books/DeleteBook.php?id=<?= htmlspecialchars($bookData['id'] ?? '') ?>" class="delete-book" onclick="return confirm('¿Estás seguro de que quieres eliminar este libro?');">Eliminar</a>
            </div>
        </section>
        <section class="notes">
            <a href="../Notes/NewNote.php?book_id=<?= htmlspecialchars($bookData['id'] ?? '') ?>" class="add-note">Nueva nota</a>
            <?php if (empty($notes)): ?>
                <p class="no-notes">No hay notas disponibles.</p>
            <?php else: ?>
                <?php foreach ($notes as $note): ?>
                    <article class="note-card">
                        <h4 class="note-title"><?= htmlspecialchars(decrypt_data($note['title'])) ?></h4>
                        <?php
                        $noteContent = isset($note['content']) ? strip_tags(decrypt_data($note['content'])) : 'Sin contenido';
                        $noteExcerpt = (function_exists('mb_strlen') && function_exists('mb_substr'))
                            ? (mb_strlen($noteContent) > 50 ? mb_substr($noteContent, 0, 50) . '...' : $noteContent)
                            : (strlen($noteContent) > 50 ? substr($noteContent, 0, 50) . '...' : $noteContent);
                        ?>
                        <p><?= htmlspecialchars($noteExcerpt) ?></p>
                        <div class="note-options">
                            <a href="../Notes/Note.php?note_id=<?= htmlspecialchars($note['id'] ?? '') ?>&book_id=<?= htmlspecialchars($bookData['id'] ?? '') ?>" class="view-note">Ver</a>
                            <a href="../Notes/EditNote.php?note_id=<?= htmlspecialchars($note['id'] ?? '') ?>&book_id=<?= htmlspecialchars($bookData['id'] ?? '') ?>" class="edit-note">Editar</a>
                            <a href="../Notes/DeleteNote.php?note_id=<?= htmlspecialchars($note['id'] ?? '') ?>&book_id=<?= htmlspecialchars($bookData['id'] ?? '') ?>" class="delete-note" onclick="return confirm('¿Estás seguro de que quieres eliminar esta nota?');">Eliminar</a>
                        </div>
                    </article>
                <?php endforeach; ?>
            <?php endif; ?>
        </section>
        <section class="books-children">
            <a href="../Books/AddBookChild.php?parent_id=<?= htmlspecialchars($bookData['id'] ?? '') ?>" class="add-book-child">Nuevo libro secundario</a>
            <?php if (empty($booksChildren)): ?>
                <p class="no-books-children">No hay libros secundarios disponibles.</p>
            <?php else: ?>
                <?php foreach ($booksChildren as $child): ?>
                    <article class="book-child-card">
                        <h4 class="book-title"><?= htmlspecialchars(decrypt_data($child['title'])) ?></h4>
                    </article>
                <?php endforeach; ?>
            <?php endif; ?>
        </section>
        <section class="attachments">
            <a href="../Attachments/AddAttachment.php?book_id=<?= htmlspecialchars($bookData['id'] ?? '') ?>" class="add-attachment">Nuevo archivo adjunto</a>
            <?php if (empty($attachments)): ?>
                <p class="no-attachments">No hay archivos adjuntos disponibles.</p>
            <?php else: ?>
                <?php foreach ($attachments as $attachment): ?>
                    <article class="attachment-card">
                        <h4 class="attachment-title"><?= htmlspecialchars(decrypt_data($attachment['title'])) ?></h4>
                    </article>
                <?php endforeach; ?>
            <?php endif; ?>
        </section>
        <script>lucide.createIcons({attrs: {'stroke-width': 1.6, stroke: 'currentColor'}});</script>
        <script src="../js/includes/sidebar.js"></script>
    </main>
</body>
</html>