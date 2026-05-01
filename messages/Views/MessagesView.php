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

<?php include '../includes/sidebar.php'; ?>
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
                <div id="pinnedBar" aria-label="Mensaje fijado">
                    <span class="pinned-bar-icon"><i data-lucide="pin"></i></span>
                    <span class="pinned-bar-text">
                        <span class="pinned-bar-sender" id="pinnedBarSender"></span><span id="pinnedBarBody"></span>
                    </span>
                    <button class="pinned-bar-close" id="btnUnpin" aria-label="Desfijar">
                        <i data-lucide="x"></i>
                    </button>
                </div>
                <div id="typingIndicator" class="typing-indicator-wrap">
                  <div class="typing-bubble">
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                  </div>
                </div>
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

                <div id="blockedNotice" class="blocked-notice" style="display:none"></div>

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

                <div id="selectActionBar">
                    <button class="btn-select-exit" id="btnExitSelect" aria-label="Salir"><i data-lucide="x"></i></button>
                    <span id="selectCount" class="select-count-label">0 seleccionados</span>
                    <div style="flex:1"></div>
                    <button class="btn-select-action" id="btnForwardSelected" disabled aria-label="Reenviar">
                        <i data-lucide="forward"></i>
                    </button>
                    <button class="btn-select-action danger" id="btnDeleteSelected" disabled aria-label="Eliminar">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            </div>
        </section>

    </div>
</div>

<!-- modal vaciar chat -->
<div class="modal-backdrop" id="clearChatModal">
    <div class="modal-box clear-chat-box">
        <button class="btn-modal-close cc-close-btn" id="btnCloseClearChat" aria-label="Cerrar">
            <i data-lucide="x"></i>
        </button>
        <div class="cc-icon-wrap">
            <div class="cc-icon-inner">
                <i data-lucide="trash-2"></i>
            </div>
        </div>
        <h3 class="cc-title">Vaciar chat</h3>
        <p class="cc-desc">Se eliminarán <strong>todos los mensajes</strong> de esta conversación para siempre.</p>
        <div class="cc-alert">
            <i data-lucide="alert-triangle"></i>
            <span>Esta acción es irreversible y no se puede deshacer</span>
        </div>
        <div class="cc-actions">
            <button class="btn-cc-cancel" id="btnCancelClear">Cancelar</button>
            <button class="btn-cc-confirm" id="btnConfirmClear">
                <i data-lucide="trash-2"></i>
                Vaciar chat
            </button>
        </div>
    </div>
</div>

<!-- modal reportar -->
<div class="modal-backdrop" id="reportModal">
    <div class="modal-box">
        <div class="modal-header">
            <span>Reportar</span>
            <button class="btn-modal-close" id="btnCloseReport" aria-label="Cerrar">
                <i data-lucide="x"></i>
            </button>
        </div>
        <div class="modal-body">
            <p class="modal-sub">¿Por qué reportas esto?</p>
            <div class="report-options">
                <label class="report-option">
                    <input type="radio" name="report-reason" value="Spam o publicidad">
                    <span>Spam o publicidad</span>
                </label>
                <label class="report-option">
                    <input type="radio" name="report-reason" value="Contenido inapropiado">
                    <span>Contenido inapropiado</span>
                </label>
                <label class="report-option">
                    <input type="radio" name="report-reason" value="Acoso o amenazas">
                    <span>Acoso o amenazas</span>
                </label>
                <label class="report-option">
                    <input type="radio" name="report-reason" value="Otro">
                    <span>Otro</span>
                </label>
            </div>
            <div class="modal-actions">
                <button class="btn-modal-cancel" id="btnCancelReport">Cancelar</button>
                <button class="btn-modal-confirm" id="btnConfirmReport" disabled>Reportar</button>
            </div>
        </div>
    </div>
</div>

<!-- modal info contacto -->
<div class="modal-backdrop" id="contactInfoModal">
    <div class="modal-box ci-box">
        <button class="btn-modal-close ci-close-btn" id="btnCloseContact" aria-label="Cerrar">
            <i data-lucide="x"></i>
        </button>
        <div class="ci-header">
            <div class="ci-avatar-ring">
                <div class="ci-avatar-inner" id="contactInfoAvatar"></div>
            </div>
            <div class="ci-name" id="contactInfoName"></div>
            <div class="ci-status-row">
                <span class="ci-status-dot" id="contactInfoDot"></span>
                <span class="ci-status-text" id="contactInfoStatus">Cargando...</span>
            </div>
        </div>
        <div class="ci-divider"></div>
        <div class="ci-footer">
            <button class="btn-ci-block" id="btnContactBlock">
                <i data-lucide="shield-off"></i>
                <span id="btnContactBlockLabel">Bloquear usuario</span>
            </button>
        </div>
    </div>
</div>

<!-- modal eliminar conversación -->
<div class="modal-backdrop" id="deleteConvModal">
    <div class="modal-box clear-chat-box">
        <button class="btn-modal-close cc-close-btn" id="btnCloseDeleteConv" aria-label="Cerrar">
            <i data-lucide="x"></i>
        </button>
        <div class="cc-icon-wrap">
            <div class="cc-icon-inner">
                <i data-lucide="trash-2"></i>
            </div>
        </div>
        <h3 class="cc-title">Eliminar conversación</h3>
        <p class="cc-desc">Se eliminará la conversación con <strong id="deleteConvName"></strong> y todos sus mensajes.</p>
        <div class="cc-alert">
            <i data-lucide="alert-triangle"></i>
            <span>Esta acción es irreversible y no se puede deshacer</span>
        </div>
        <div class="cc-actions">
            <button class="btn-cc-cancel" id="btnCancelDeleteConv">Cancelar</button>
            <button class="btn-cc-confirm" id="btnConfirmDeleteConv">
                <i data-lucide="trash-2"></i>
                Eliminar conversación
            </button>
        </div>
    </div>
</div>

<!-- modal eliminar mensaje -->
<div class="modal-backdrop" id="deleteMessageModal">
    <div class="modal-box clear-chat-box del-msg-box">
        <button class="btn-modal-close cc-close-btn" id="btnCloseDel" aria-label="Cerrar"><i data-lucide="x"></i></button>
        <div class="cc-icon-wrap">
            <div class="cc-icon-inner">
                <i data-lucide="trash-2"></i>
            </div>
        </div>
        <h3 class="cc-title">Eliminar mensaje</h3>
        <p class="cc-desc" id="delModalDesc">¿Cómo quieres eliminar este mensaje?</p>
        <div class="cc-alert">
            <i data-lucide="alert-triangle"></i>
            <span>Esta acción es irreversible y no se puede deshacer</span>
        </div>
        <div class="cc-actions">
            <button class="btn-cc-confirm" id="btnDelForAll">
                <i data-lucide="users"></i> Eliminar para todos
            </button>
            <button class="btn-cc-cancel" id="btnDelForMe">Solo para mí</button>
            <button class="btn-modal-link" id="btnCancelDel">Cancelar</button>
        </div>
    </div>
</div>

<!-- modal info mensaje -->
<div id="infoModal" class="modal-backdrop">
  <div class="modal-box info-box">
    <div class="info-handle"></div>
    <button class="btn-modal-close info-close-btn" id="btnCloseInfo" aria-label="Cerrar">
      <i data-lucide="x"></i>
    </button>
    <div class="info-header">
      <div class="info-icon-wrap">
        <i data-lucide="info"></i>
      </div>
      <span class="info-title">Información</span>
    </div>
    <div class="info-preview" id="infoMsgPreview"></div>
    <div class="info-body">
      <div class="info-row" id="infoRowDate">
        <div class="info-row-icon-wrap"><i data-lucide="clock"></i></div>
        <div class="info-row-content">
          <span class="info-label">Enviado</span>
          <span class="info-date" id="infoDate"></span>
          <span class="info-relative" id="infoRelative"></span>
        </div>
      </div>
      <div class="info-row" id="infoRowStatus">
        <div class="info-row-icon-wrap" id="infoStatusIconWrap">
          <i data-lucide="check-check" id="infoStatusIcon"></i>
        </div>
        <div class="info-row-content">
          <span class="info-label">Estado</span>
          <span class="info-status-text" id="infoStatusText"></span>
        </div>
      </div>
      <div class="info-row" id="infoRowType">
        <div class="info-row-icon-wrap" id="infoTypeIconWrap">
          <i data-lucide="message-square" id="infoTypeIcon"></i>
        </div>
        <div class="info-row-content">
          <span class="info-label">Tipo</span>
          <span class="info-type-text" id="infoTypeText"></span>
        </div>
      </div>
    </div>
    <div class="info-footer">
      <button class="btn-info-close" id="btnCloseInfo2">Cerrar</button>
    </div>
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

<div id="bookmarksBackdrop"></div>
<div id="bookmarksDrawer" role="dialog" aria-label="Mensajes destacados">
    <div class="bm-header">
        <i data-lucide="bookmark" style="width:16px;height:16px;color:#a78bfa;flex-shrink:0"></i>
        <span class="bm-title">Mensajes destacados</span>
        <button class="bm-close-btn" id="btnCloseBookmarks" aria-label="Cerrar"><i data-lucide="x"></i></button>
    </div>
    <div class="bm-list" id="bmList"></div>
</div>

<div id="forwardBackdrop"></div>
<div id="forwardSheet" role="dialog" aria-label="Reenviar mensaje">
    <div class="fw-handle"></div>
    <div class="fw-header">
        <div class="fw-header-row">
            <span class="fw-title">Reenviar mensaje</span>
            <button class="fw-close-btn" id="btnCloseForward" aria-label="Cerrar">
                <i data-lucide="x"></i>
            </button>
        </div>
        <div class="fw-msg-preview" id="fwMsgPreview">
            <div class="fw-msg-preview-icon">
                <i data-lucide="forward"></i>
            </div>
            <div class="fw-msg-preview-text">
                <span class="fw-msg-preview-label">Mensaje a reenviar</span>
                <span id="fwMsgPreviewText">—</span>
            </div>
        </div>
    </div>
    <div class="fw-search-wrap">
        <i data-lucide="search" class="fw-search-icon"></i>
        <input type="text" id="forwardSearch" class="fw-search" placeholder="Buscar conversación..." autocomplete="off">
        <button class="fw-search-clear" id="fwSearchClear" aria-label="Limpiar" tabindex="-1">
            <i data-lucide="x"></i>
        </button>
    </div>
    <div class="fw-conv-list" id="forwardConvList"></div>
    <div class="fw-selection-pill-wrap">
        <div class="fw-selection-pill" id="fwSelectionPill">
            <span class="fw-pill-dot"></span>
            <span id="fwSelectionPillText">1 seleccionada</span>
        </div>
    </div>
    <div class="fw-actions">
        <button class="btn-fw-cancel" id="btnCancelForward">Cancelar</button>
        <button class="btn-fw-send" id="btnConfirmForward" disabled>
            <i data-lucide="send"></i>
            <span id="btnConfirmForwardLabel">Reenviar</span>
        </button>
    </div>
</div>

<script>
var convData = <?= json_encode($conversations, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) ?>;
var currentUid = <?= (int)$uid ?>;
</script>
<script src="../js/includes/sidebar.js"></script>
<script src="../js/includes/toast.js"></script>
<script src="../js/messages/messages-utils.js?v=<?= filemtime('../js/messages/messages-utils.js') ?>"></script>
<script src="../js/messages/messages-ui.js?v=<?= filemtime('../js/messages/messages-ui.js') ?>"></script>
<script src="../js/messages/messages-conv.js?v=<?= filemtime('../js/messages/messages-conv.js') ?>"></script>
<script src="../js/messages/messages.js?v=<?= filemtime('../js/messages/messages.js') ?>"></script>
<script>lucide.createIcons(); document.documentElement.style.visibility='';</script>
</body>
</html>
