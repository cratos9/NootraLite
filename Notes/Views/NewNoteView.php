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
        <link rel="icon" type="image/x-icon" href="../favicon.ico">
        <link rel="stylesheet" href="../css/Notes/NewNote.css">
        <link rel="stylesheet" href="../css/includes/sidebar.css">
        <link rel="stylesheet" href="../css/includes/lightMode.css">
        <script src="../tinymce_8.4.0/tinymce/js/tinymce/tinymce.min.js"></script>
        <title>Nueva Nota</title>
    </head>
    <body>
        <?php
            include_once '../includes/lightMode.php';
            include_once '../includes/sidebar.php';
            if (!empty($errors)) {
                foreach ($errors as $error) {
                    echo '
                    <script>
                    message.error("' . $error . '");
                    </script>
                    ';
                }
            }
        ?>
        <main>
            <a href="../Books/Book.php?id=<?= urlencode((string)($_GET['book_id'] ?? '')) ?>" class="cancel">Cancelar</a>
            <form class="new-note-form" method="POST" action="NewNote.php">
                <input type="hidden" name="book_id" value="<?= htmlspecialchars($_GET['book_id'] ?? '') ?>">
                <input type="text" name="title" placeholder="Título de la nota" required>
                <textarea id="editor" name="content"></textarea>
                <button type="submit" class="save">Guardar</button>
            </form>
        </main>

        <script src="../js/Notes/TextEditor.js"></script>
        <script>lucide.createIcons({attrs: {'stroke-width': 1.6, stroke: 'currentColor'}});</script>
        <script src="../js/includes/sidebar.js"></script>
    </body>
</html>