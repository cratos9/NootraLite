<?php include_once '../Dashboard/get_last_quick_notes.php'; ?>
<div class="dash-last-notes">
    <header class="notes-dashboard_tittle"><i data-lucide="notebook-text" class="icon-note-tittle"></i><h3>Notas rápidas creadas</h3></header>
    <div class="dash-books-flex">
        <?php if (!empty($lastQuickNotes)): ?>
            <?php foreach ($lastQuickNotes as $note): ?>
                <?php $noteColor = !empty($note['color']) ? $note['color'] : '#6d28d9'; ?>
                <a href="../QuickNotes/index.php" class="dash-book-card" style="--book-color: <?php echo htmlspecialchars($noteColor, ENT_QUOTES, 'UTF-8'); ?>;">
                    <div class="dash-book-cover" style="background-color: <?php echo htmlspecialchars($noteColor, ENT_QUOTES, 'UTF-8'); ?>;">
                        <i data-lucide="notepad-text" class="icon-note"></i>
                    </div>
                    <div class="dash-book-info">
                        <h4 class="dash-book-title"><?php echo htmlspecialchars(decrypt_data($note['note'])); ?></h4>
                        <p class="dash-book-meta">Creada: <?php echo date('d M Y, H:i', strtotime($note['created_at'])); ?></p>
                    </div>
                </a>
            <?php endforeach; ?>
        <?php else: ?>
            <div class="dash-no-books">
                <i data-lucide="notepad-text" class="icon-book-off"></i>
                <p>No has creado ninguna nota rápida recientemente.</p>
            </div>
        <?php endif; ?>
    </div>
</div>