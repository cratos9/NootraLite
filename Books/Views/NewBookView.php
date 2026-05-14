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
        <div class="form-container">
            <form action="NewBook.php<?= $parentId ? '?parent_id=' . urlencode((string)$parentId) : '' ?>" method="post" class="form-section">
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

            <!-- Preview Section (Desktop only) -->
            <div class="preview-section">
                <h2>Previsualización</h2>
                <article class="book-card-preview" id="bookPreview" style="--book-color: #000000; border-color: #000000;">
                    <h3 class="book-title-preview">
                        <i data-lucide="book-open" class="icon-book-preview" style="color: #000000;"></i>
                        <span id="previewTitle">Título del Libro</span>
                    </h3>
                    <p class="book-description-preview" id="previewDescription">Sin descripción</p>
                    <p class="book-category-preview"><strong>Categoría:</strong> <span id="previewCategory">Sin categoría</span></p>
                    <p class="book-semester-preview" id="semesterContainer" style="display: none;"><strong>Semestre:</strong> <span id="previewSemester"></span></p>
                    <p class="book-tags-preview" id="tagsContainer" style="display: none;"><strong>Etiquetas:</strong> <span id="previewTags"></span></p>
                </article>
            </div>
        </div>
    </main>
    <script>lucide.createIcons({attrs: {'stroke-width': 1.6, stroke: 'currentColor'}});</script>
    <script src="../js/includes/sidebar.js"></script>
    <script src="../js/Books/NewBook.js" defer></script>
</body>
</html>