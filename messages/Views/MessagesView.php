<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mensajes — NootraLite</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
    <link rel="stylesheet" href="../css/includes/sidebar.css">
    <link rel="stylesheet" href="../css/messages/messages.css">
</head>
<body>

<div class="main messages-main">
    <div class="msg-layout">

        <!-- panel izquierdo -->
        <aside class="conv-panel">
            <div class="conv-header">
                <span class="conv-title">Mensajes</span>
                <button class="btn-new-conv" id="btnNewConv" aria-label="Nueva conversación">
                    <i data-lucide="plus"></i>
                </button>
            </div>
            <div class="conv-search">
                <i data-lucide="search"></i>
                <input type="text" id="convSearch" placeholder="Buscar conversaciones..." autocomplete="off">
            </div>
            <div class="conv-list" id="convList">
                <!-- se llena con JS -->
            </div>
        </aside>

        <!-- panel derecho: chat -->
        <section class="chat-panel" id="chatPanel">
            <div class="chat-empty" id="chatEmpty">
                <i data-lucide="message-circle"></i>
                <p>Selecciona una conversación</p>
            </div>

            <div class="chat-active" id="chatActive">
                <div class="chat-header" id="chatHeader"></div>
                <div class="chat-messages" id="chatMessages"></div>
                <div class="chat-input-bar">
                    <button class="btn-attach" id="btnAttach" aria-label="Adjuntar">
                        <i data-lucide="paperclip"></i>
                    </button>
                    <input type="file" id="fileInput" style="display:none" accept="image/*,.pdf,.doc,.docx,.zip">
                    <input type="text" id="msgInput" class="msg-input" placeholder="Escribe un mensaje..." autocomplete="off">
                    <button class="btn-send" id="btnSend" aria-label="Enviar">
                        <i data-lucide="send"></i>
                    </button>
                </div>
            </div>
        </section>

    </div>
</div>

<!-- modal nueva conversación -->
<div class="modal-backdrop" id="newConvBackdrop">
    <div class="modal-box">
        <div class="modal-header">
            <span>Nueva conversación</span>
            <button class="btn-modal-close" id="btnCloseModal" aria-label="Cerrar">
                <i data-lucide="x"></i>
            </button>
        </div>
        <div class="modal-body">
            <input type="text" id="userSearch" placeholder="Buscar usuario..." autocomplete="off">
            <div class="user-results" id="userResults"></div>
        </div>
    </div>
</div>

<script>
var convData = <?= json_encode($conversations) ?>;
var currentUid = <?= (int)$uid ?>;
</script>
<script src="../js/includes/sidebar.js"></script>
<script src="../js/messages/messages.js"></script>
<script>lucide.createIcons();</script>
</body>
</html>
