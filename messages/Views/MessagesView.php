<!DOCTYPE html>
<html lang="es">
<head>
    <script>document.documentElement.style.visibility='hidden';document.documentElement.style.background='#0f0f1a'</script>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" type="image/x-icon" href="../assets/favicon.ico">
    <title>Mensajes — NootraLite</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
    <link rel="stylesheet" href="../css/includes/sidebar.css">
    <link rel="stylesheet" href="../css/includes/toast.css">
    <link rel="stylesheet" href="../css/messages/messages.css">
</head>
<body>

<div class="main messages-main">
    <div class="msg-layout">

        <!-- panel izquierdo -->
        <aside class="conv-panel">
            <div class="new-conv-panel" id="newConvPanel">
                <div class="ncp-header">
                    <button class="ncp-back" id="ncpBack" aria-label="Volver"><i data-lucide="arrow-left"></i></button>
                    <span class="ncp-title" id="ncpTitle">Nueva conversación</span>
                </div>
                <div class="ncp-screen" id="ncpScreen1">
                    <div class="ncp-options">
                        <div class="ncp-option" data-ncp="search">
                            <span class="ncp-opt-icon" style="background:#7c3aed"><i data-lucide="user-search"></i></span>
                            <span class="ncp-opt-label">Buscar usuario</span>
                        </div>
                    </div>
                </div>
                <div class="ncp-screen" id="ncpScreen2" style="display:none">
                    <div class="ncp-search-wrap">
                        <input type="text" id="ncpUserSearch" placeholder="Buscar usuario..." autocomplete="off">
                    </div>
                    <div class="ncp-results" id="ncpResults"></div>
                </div>
            </div>
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
            <div class="conv-filters">
                <button class="filter-chip active" data-filter="all">Todos</button>
                <button class="filter-chip" data-filter="unread">No leídos</button>
                <button class="filter-chip" data-filter="favorites">Favoritos</button>
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

                <div class="reply-bar" id="replyBar" style="display:none">
                    <div class="reply-bar-indicator"></div>
                    <div class="reply-bar-content">
                        <span class="reply-bar-sender" id="replyBarSender"></span>
                        <span class="reply-bar-body" id="replyBarBody"></span>
                    </div>
                    <button class="reply-bar-close" id="replyBarClose" aria-label="Cancelar respuesta">
                        <i data-lucide="x"></i>
                    </button>
                </div>

                <div class="chat-input-bar">
                    <button class="btn-attach" id="btnAttach" aria-label="Adjuntar">
                        <i data-lucide="paperclip"></i>
                    </button>
                    <input type="file" id="fileInput" style="display:none" accept="image/*,.pdf,.doc,.docx,.zip">
                    <div class="attach-popup" id="attachPopup">
                        <div class="attach-option" data-action="photos">
                            <span class="attach-icon" style="background:#2563eb"><i data-lucide="image"></i></span>
                            <span class="attach-label">Fotos</span>
                        </div>
                        <div class="attach-option" data-action="document">
                            <span class="attach-icon" style="background:#7c3aed"><i data-lucide="file-text"></i></span>
                            <span class="attach-label">Documento</span>
                        </div>
                        <div class="attach-option" data-action="camera">
                            <span class="attach-icon" style="background:#059669"><i data-lucide="camera"></i></span>
                            <span class="attach-label">Cámara</span>
                        </div>
                        <div class="attach-option" data-action="contact">
                            <span class="attach-icon" style="background:#d97706"><i data-lucide="user"></i></span>
                            <span class="attach-label">Contacto</span>
                        </div>
                        <div class="attach-option" data-action="location">
                            <span class="attach-icon" style="background:#dc2626"><i data-lucide="map-pin"></i></span>
                            <span class="attach-label">Ubicación</span>
                        </div>
                        <div class="attach-option" data-action="audio">
                            <span class="attach-icon" style="background:#ec4899"><i data-lucide="mic"></i></span>
                            <span class="attach-label">Audio</span>
                        </div>
                    </div>
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
<script src="../js/includes/toast.js"></script>
<script src="../js/messages/messages.js?v=<?= filemtime('../js/messages/messages.js') ?>"></script>
<script>lucide.createIcons(); document.documentElement.style.visibility='';</script>
</body>
</html>
