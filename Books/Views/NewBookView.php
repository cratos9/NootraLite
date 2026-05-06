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
    <link rel="stylesheet" href="../css/Books/NewBook.css">
    <link rel="stylesheet" href="../css/includes/sidebar.css">
    <link rel="stylesheet" href="../css/includes/lightMode.css">
    <title>Nuevo Libro</title>
</head>
<body>
    <main>
        <a href="<?= $parentId ? 'Book.php?id=' . urlencode((string)$parentId) : 'Books.php' ?>" class="cancel">Cancelar</a>
        <form action="NewBook.php<?= $parentId ? '?parent_id=' . urlencode((string)$parentId) : '' ?>" method="post">
            <?php if ($parentId): ?>
                <input type="hidden" name="parent_id" value="<?= htmlspecialchars((string)$parentId) ?>">
            <?php endif; ?>
            <h1>Nuevo Libro <i data-lucide="book-open" class="icon-book"></i></h1>
            <div class="form-group">
                <label for="title">Título:</label>
                <input type="text" id="title" name="title" class="input-field" maxlength="255" required>
            </div>
            <div class="form-group">
                <label for="description">Descripción:</label>
                <textarea id="description" name="description" class="input-field" maxlength="255"></textarea>
            </div>
            <div class="form-group">
                <label for="color">Color:</label>
                <input type="color" id="color" name="color" class="input-field">
            </div>
            <div class="form-group">
                <label for="category">Categoría:</label>
                <input type="text" id="category" name="category" class="input-field" maxlength="255">
            </div>
            <div class="form-group">
                <label for="semester">Semestre:</label>
                <input type="text" id="semester" name="semester" class="input-field" maxlength="255" placeholder="Opcional">
            </div>
            <div class="form-group">
                <label for="tags">Etiquetas:</label>
                <input type="text" id="tags" name="tags" class="input-field" maxlength="255" placeholder="Ejemplo: matemáticas, álgebra, geometría">
            </div>
            <button type="submit" name="create_book" class="btn-create">Crear Libro</button>
        </form>
    </main>
    <script>lucide.createIcons({attrs: {'stroke-width': 1.6, stroke: 'currentColor'}});</script>
    <script src="../js/includes/sidebar.js"></script>
</body>
</html>