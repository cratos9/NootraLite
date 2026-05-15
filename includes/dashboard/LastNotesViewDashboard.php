<?php include_once '../Dashboard/get_last_notes.php'; ?>
<div class="dash-last-notes">
    <header class="notes-dashboard_tittle"><i data-lucide="notebook-text" class="icon-note-tittle"></i><h3>Últimas notas vistas</h3></header>
    <div class="dash-books-flex">
        <?php if (!empty($lastNotes)): ?>
            <?php foreach ($lastNotes as $note): ?>
                <?php $noteColor = !empty($note['notebook_color']) ? $note['notebook_color'] : '#6d28d9'; ?>
                <a href="../Notes/Note.php?note_id=<?php echo $note['id']; ?>&book_id=<?php echo $note['notebook_id']; ?>" class="dash-book-card" style="--book-color: <?php echo htmlspecialchars($noteColor, ENT_QUOTES, 'UTF-8'); ?>;">
                    <div class="dash-book-cover" style="background-color: <?php echo htmlspecialchars($noteColor, ENT_QUOTES, 'UTF-8'); ?>;">
                        <i data-lucide="notepad-text" class="icon-note"></i>
                    </div>
                    <div class="dash-book-info">
                        <h4 class="dash-book-title"><?php echo htmlspecialchars(decrypt_data($note['title'])); ?></h4>
                        <p class="dash-book-meta">Último acceso: <?php echo date('d M Y, H:i', strtotime($note['last_accessed'])); ?></p>
                    </div>
                </a>
            <?php endforeach; ?>
        <?php else: ?>
            <div class="dash-no-books">
                <i data-lucide="notepad" class="icon-book-off"></i>
                <p>No has accedido a ninguna nota recientemente.</p>
            </div>
        <?php endif; ?>
    </div>
</div>