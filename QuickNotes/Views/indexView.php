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
        <link rel="icon" type="image/x-icon" href="../favicon.ico">
        <link rel="stylesheet" href="../css/QuickNotes/index.css">
        <link rel="stylesheet" href="../css/includes/sidebar.css">
        <link rel="stylesheet" href="../css/includes/lightMode.css">
        <title>Notas rapidas</title>
    </head>
    <body>
        <?php
            include_once '../includes/lightMode.php';

            if (isset($_GET['attachment_msg']) && isset($_GET['attachment_type'])) {
                $msg = $_GET['attachment_msg'];
                $type = $_GET['attachment_type'];
                echo '
                    <script>
                        message.' . ($type === 'success' ? 'success' : 'error') . '("' . $msg . '");
                    </script>
                ';
            }
        ?>
        <main>
            <a href="NewQuickNote.php" class="new-note">Nueva nota rápida</a>
            <section class="notes">
                <?php if (empty($quickNotes)): ?>
                    <p class="no-notes">No hay notas rápidas disponibles.</p>
                <?php else: ?>
                    <?php foreach ($quickNotes as $note): ?>
                        <article class="note-card" style="background-color: <?= $note['color'] ?>;" onclick="if (confirm('¿Eliminar esta nota rápida?')) { window.location.href='DeleteQuickNote.php?id=<?= $note['id'] ?>'; }">
                            <i data-lucide='trash-2' class="trash" hidden="hidden"></i>
                            <p class="note-info">
                                <?= htmlspecialchars(decrypt_data($note['note'])) ?>
                                <br>
                                <?= $note['created_at'] ?>
                            </p>
                        </article>
                    <?php endforeach; ?>
                <?php endif; ?>
            </section>
        </main>

        <script>lucide.createIcons({attrs: {'stroke-width': 1.6, stroke: 'currentColor'}});</script>
        <script src="../js/includes/sidebar.js"></script>
    </body>
</html>