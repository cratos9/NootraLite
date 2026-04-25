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
        <link rel="stylesheet" href="../css/includes/IA.css">
        <script src="../tinymce_8.4.0/tinymce/js/tinymce/tinymce.min.js"></script>
        <title>Nueva Nota</title>
    </head>
    <body>
        <?php
            include_once '../includes/lightMode.php';
            $activePage = 'notebooks';
            include_once '../includes/sidebar.php';
        ?>
        <div id="ia-panel" hidden>
            <?php include_once '../includes/IA.php'; ?>
        </div>
        <?php
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
                <div class="title-container">
                    <input type="text" name="title" placeholder="Título de la nota" required>
                    <button
                        type="button"
                        id="ask-ia"
                        class="ia-button"
                        onclick="toggleIAPanel()"
                        title="Inteligencia Artificial"
                    >
                        <i data-lucide='brain' class="brain"></i> <p class="brain-text">IA</p>
                    </button>
                </div>
                <textarea id="editor" name="content"></textarea>
                <button type="submit" class="save">Guardar</button>
            </form>
        </main>

        <script src="../js/Notes/TextEditor.js"></script>
        <script>lucide.createIcons({attrs: {'stroke-width': 1.6, stroke: 'currentColor'}});</script>
        <script>
            let iaTimer = null;

            function toggleIAPanel() {
                const panel = document.getElementById('ia-panel');
                if (!panel) {
                    return;
                }

                if (iaTimer) {
                    clearTimeout(iaTimer);
                    iaTimer = null;
                }

                if (panel.hidden) {
                    panel.hidden = false;
                    panel.classList.remove('out_ia-card');
                    panel.classList.add('in_ia-card');
                    return;
                }

                panel.classList.remove('in_ia-card');
                panel.classList.add('out_ia-card');

                iaTimer = setTimeout(() => {
                    panel.hidden = true;
                    iaTimer = null;
                }, 500);
            }
        </script>
        <script src="../js/includes/sidebar.js"></script>
    </body>
</html>