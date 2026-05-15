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
        <link rel="stylesheet" href="../css/QuickNotes/NewQuickNote.css">
        <link rel="stylesheet" href="../css/includes/sidebar.css">
        <link rel="stylesheet" href="../css/includes/lightMode.css">
        <title>Notas rapidas</title>
    </head>
    <body>
        <?php
            include_once '../includes/lightMode.php';
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
            <a href="index.php" class="cancel">Cancelar</a>
            <form action="NewQuickNote.php" method="POST">
                <h1>Nueva nota rápida</h1>
                <label>Color de la nota</label>
                <div class="color-radios" role="radiogroup" aria-label="Color de la nota">
                    <input type="radio" id="color-7c3aed" name="color" value="#7c3aed" checked>
                    <label for="color-7c3aed" class="color-radio" style="background:#7c3aed" title="Morado"></label>

                    <input type="radio" id="color-ec4899" name="color" value="#ec4899">
                    <label for="color-ec4899" class="color-radio" style="background:#ec4899" title="Rosa"></label>

                    <input type="radio" id="color-10b981" name="color" value="#10b981">
                    <label for="color-10b981" class="color-radio" style="background:#10b981" title="Verde"></label>

                    <input type="radio" id="color-f59e0b" name="color" value="#f59e0b">
                    <label for="color-f59e0b" class="color-radio" style="background:#f59e0b" title="Naranja"></label>

                    <input type="radio" id="color-3b82f6" name="color" value="#3b82f6">
                    <label for="color-3b82f6" class="color-radio" style="background:#3b82f6" title="Azul"></label>

                    <input type="radio" id="color-ef4444" name="color" value="#ef4444">
                    <label for="color-ef4444" class="color-radio" style="background:#ef4444" title="Rojo"></label>
                </div>

                <textarea id="qn-note" name="note" placeholder="Escribe tu nota rápida aquí..." required minlength="1" maxlength="150"></textarea>
                <div class="word-row"><span id="qn-word-count">0</span>/150 caracteres</div>
                <button type="submit" class="new-note">Guardar nota rápida</button>
            </form>
        </main>
        <script>
            (function(){
                function initCounter(){
                    var ta = document.getElementById('qn-note');
                    var countEl = document.getElementById('qn-word-count');
                    if(!ta || !countEl) return;
                    function updateCount(){
                        var text = ta.value.trim();
                        var chars = text.length;
                        if(chars > 150){
                            ta.value = text.slice(0,150);
                            chars = 150;
                        }
                        countEl.textContent = chars;
                    }
                    ta.addEventListener('input', updateCount);
                    ta.addEventListener('paste', function(){ setTimeout(updateCount, 10); });
                    updateCount();
                }
                if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', initCounter); else initCounter();
            })();
            lucide.createIcons({attrs: {'stroke-width': 1.6, stroke: 'currentColor'}});
        </script>