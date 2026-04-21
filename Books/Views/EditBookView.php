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
    <title>Editar Libro</title>
</head>
<body>
    <main>
        <a href="Books.php" class="cancel">Cancelar</a>
        <form action="EditBook.php?id=<?= urlencode($oldBookData['id'] ?? '') ?>" method="post">
            <input type="hidden" name="id" value="<?= htmlspecialchars($oldBookData['id'] ?? '') ?>">
            <h1>Editar Libro <i data-lucide="book-open" class="icon-book"></i></h1>
            <div class="form-group">
                <label for="title">Título:</label>
                <input type="text" id="title" name="title" class="input-field" maxlength="255" required value="<?= htmlspecialchars(decrypt_data($oldBookData['title'] ?? '')) ?>">
            </div>
            <div class="form-group">
                <label for="description">Descripción:</label>
                <textarea id="description" name="description" class="input-field" maxlength="255"><?= htmlspecialchars(decrypt_data($oldBookData['description'] ?? '')) ?></textarea>
            </div>
            <div class="form-group">
                <label for="color">Color:</label>
                <input type="color" id="color" name="color" class="input-field" value="<?= htmlspecialchars($oldBookData['color'] ?? '') ?>" required>
            </div>
            <div class="form-group">
                <label for="category">Categoría:</label>
                <input type="text" id="category" name="category" class="input-field" maxlength="255" value="<?= htmlspecialchars(decrypt_data($oldBookData['category'] ?? '')) ?>">
            </div>
            <div class="form-group">
                <label for="semester">Semestre:</label>
                <input type="text" id="semester" name="semester" class="input-field" maxlength="255" placeholder="Opcional" value="<?= htmlspecialchars($oldBookData['semester'] ?? '') ?>">
            </div>
            <div class="form-group">
                <label for="tags">Etiquetas:</label>
                <input type="text" id="tags" name="tags" class="input-field" maxlength="255" placeholder="Ejemplo: matemáticas, álgebra, geometría" value="<?= htmlspecialchars(decrypt_data($oldBookData['tags'] ?? '')) ?>">
            </div>
            <button type="submit" name="create_book" class="btn-create">Editar Libro</button>
        </form>
    </main>
    <script>lucide.createIcons({attrs: {'stroke-width': 1.6, stroke: 'currentColor'}});</script>
    <script src="../js/includes/sidebar.js"></script>
</body>
</html>