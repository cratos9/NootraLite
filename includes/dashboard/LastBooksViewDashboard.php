<?php include_once '../Dashboard/get_last_books.php'; ?>
<div class="dash-last-books">
    <header class="books-dashboard_tittle"><i data-lucide="book-open" class="icon-book-open"></i><h3>Últimos libros vistos</h3></header>
    <div class="dash-books-flex">
        <?php if (!empty($lastBooks)): ?>
            <?php foreach ($lastBooks as $book): ?>
                <?php $bookColor = !empty($book['color']) ? $book['color'] : '#6d28d9'; ?>
                <a href="../Books/Book.php?id=<?php echo $book['id']; ?>" class="dash-book-card" style="--book-color: <?php echo htmlspecialchars($bookColor, ENT_QUOTES, 'UTF-8'); ?>;">
                    <div class="dash-book-cover" style="background-color: <?php echo htmlspecialchars($bookColor, ENT_QUOTES, 'UTF-8'); ?>;">
                        <i data-lucide="book" class="icon-book"></i>
                    </div>
                    <div class="dash-book-info">
                        <h4 class="dash-book-title"><?php echo htmlspecialchars(decrypt_data($book['title'])); ?></h4>
                        <p class="dash-book-meta">Último acceso: <?php echo date('d M Y, H:i', strtotime($book['last_accessed'])); ?></p>
                    </div>
                </a>
            <?php endforeach; ?>
        <?php else: ?>
            <div class="dash-no-books">
                <i data-lucide="book-off" class="icon-book-off"></i>
                <p>No has accedido a ningún libro recientemente.</p>
            </div>
        <?php endif; ?>
    </div>
</div>