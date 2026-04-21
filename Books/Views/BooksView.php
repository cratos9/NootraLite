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
    <link rel="stylesheet" href="../css/Books/Books.css">
    <link rel="stylesheet" href="../css/includes/sidebar.css">
    <link rel="stylesheet" href="../css/includes/lightMode.css">
    <title>Libros</title>
</head>
<body>
    <main>
        <a href="NewBook.php" class="new-book">Nuevo Libro</a>
        <section class="books">
            <?php if (empty($books)): ?>
                <p class="no-books">No hay libros disponibles.</p>
            <?php else: ?>
                <?php foreach ($books as $book): ?>
                    <article class="book-card" style="--book-color: <?= htmlspecialchars($book['color'] ?? '#000000') ?>; border-color: <?= htmlspecialchars($book['color'] ?? '#000000') ?>;">
                        <h3 class="book-title"><i data-lucide="book-open" class="icon-book" style="color: <?= htmlspecialchars($book['color'] ?? '#000000') ?>"></i><?= htmlspecialchars(decrypt_data($book['title'])) ?></h3>
                        <p class="book-description"><?= htmlspecialchars(decrypt_data($book['description'])) ?></p>
                        <p class="book-category"><strong>Categoría:</strong> <?= htmlspecialchars(decrypt_data($book['category'])) ?></p>
                        <?php if (!empty(htmlspecialchars($book['semester']))): ?>
                            <p class="book-semester"><strong>Semestre:</strong> <?= htmlspecialchars($book['semester']) ?></p>
                        <?php endif; ?>
                        <?php if (!empty(htmlspecialchars(decrypt_data($book['tags'])))): ?>
                            <p class="book-tags"><strong>Etiquetas:</strong> <?= htmlspecialchars(decrypt_data($book['tags'])) ?></p>
                        <?php endif; ?>
                        <a href="Book.php?id=<?= $book['id'] ?>" class="open-book" style="border-color: <?= htmlspecialchars($book['color'] ?? '#000000') ?>">Abrir Libro</a>
                    </article>
                <?php endforeach; ?>
            <?php endif; ?>
        </section>
    </main>
    <script>lucide.createIcons({attrs: {'stroke-width': 1.6, stroke: 'currentColor'}});</script>
    <script src="../js/includes/sidebar.js"></script>
</body>
</html>