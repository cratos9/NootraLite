// mensajes - logica principal

var conversations = convData || [];
var activeConvId = null;

var convList     = document.getElementById('convList');
var chatEmpty    = document.getElementById('chatEmpty');
var chatActive   = document.getElementById('chatActive');
var chatHeader   = document.getElementById('chatHeader');
var chatMessages = document.getElementById('chatMessages');
var msgInput     = document.getElementById('msgInput');
var btnSend      = document.getElementById('btnSend');
var convSearch   = document.getElementById('convSearch');
var activeFilter = 'all';
var attachPopup  = document.getElementById('attachPopup');
var fileInput    = document.getElementById('fileInput');

var pendingAttUrl  = null;
var pendingAttType = null;
var pendingAttName = null;
var pendingAttSize = 0;

var btnNewConv    = document.getElementById('btnNewConv');
var newConvBackdrop = document.getElementById('newConvBackdrop');
var btnCloseModal = document.getElementById('btnCloseModal');
var userSearch    = document.getElementById('userSearch');

var newConvPanel  = document.getElementById('newConvPanel');
var ncpBack       = document.getElementById('ncpBack');
var ncpScreen1    = document.getElementById('ncpScreen1');
var ncpScreen2    = document.getElementById('ncpScreen2');
var ncpUserSearch = document.getElementById('ncpUserSearch');
var ncpResults    = document.getElementById('ncpResults');
var userResults   = document.getElementById('userResults');

var pollInterval = null;
var lastMsgId = 0;

var activeConvName = null;
var replyToId = null, replyToBody = null, replyToSender = null;
var replyBar       = document.getElementById('replyBar');
var replyBarSender = document.getElementById('replyBarSender');
var replyBarBody   = document.getElementById('replyBarBody');
var replyBarClose  = document.getElementById('replyBarClose');

// --- utilidades ---

function activateReply(msgId, body, senderName) {
    replyToId = msgId; replyToBody = body; replyToSender = senderName;
    replyBarSender.textContent = senderName;
    replyBarBody.textContent = body;
    replyBar.classList.remove('reply-bar-leaving');
    replyBar.style.display = 'flex';
    void replyBar.offsetWidth;
    replyBar.classList.add('reply-bar-entering');
    replyBar.addEventListener('animationend', function h() {
        replyBar.removeEventListener('animationend', h);
        replyBar.classList.remove('reply-bar-entering');
    });
    lucide.createIcons({ nodes: [replyBar] });
    // pulso en el mensaje origen
    var srcRow = chatMessages.querySelector('[data-msg-id="' + msgId + '"]');
    if (srcRow) {
        var bub = srcRow.querySelector('.msg-bubble');
        if (bub) {
            bub.classList.remove('reply-source-flash');
            void bub.offsetWidth;
            bub.classList.add('reply-source-flash');
            bub.addEventListener('animationend', function h2() {
                bub.removeEventListener('animationend', h2);
                bub.classList.remove('reply-source-flash');
            });
        }
    }
    msgInput.focus();
}

function cancelReply() {
    replyToId = replyToBody = replyToSender = null;
    replyBarSender.textContent = '';
    replyBarBody.textContent = '';
    if (replyBar.style.display === 'none') return;
    replyBar.classList.remove('reply-bar-entering');
    replyBar.classList.add('reply-bar-leaving');
    replyBar.addEventListener('animationend', function h() {
        replyBar.removeEventListener('animationend', h);
        replyBar.classList.remove('reply-bar-leaving');
        replyBar.style.display = 'none';
    });
}

replyBarClose.addEventListener('click', cancelReply);

function avatarColor(name) {
    var colors = ['#7c3aed','#ec4899','#2563eb','#059669','#d97706','#dc2626'];
    var i = 0;
    if (name) for (var c = 0; c < name.length; c++) i += name.charCodeAt(c);
    return colors[i % colors.length];
}

function initials(name) {
    if (!name) return '?';
    var parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
}

function formatTime(dt) {
    if (!dt) return '';
    var d = new Date(dt);
    var now = new Date();
    var diffDays = Math.floor((now - d) / 86400000);
    if (diffDays === 0) {
        var h = d.getHours().toString().padStart(2,'0');
        var m = d.getMinutes().toString().padStart(2,'0');
        return h + ':' + m;
    }
    if (diffDays === 1) return 'ayer';
    if (diffDays < 7) {
        var dias = ['dom','lun','mar','mié','jue','vie','sáb'];
        return dias[d.getDay()];
    }
    return d.getDate() + '/' + (d.getMonth()+1);
}

function formatMsgTime(dt) {
    if (!dt) return '';
    var d = new Date(dt);
    return d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0');
}

// actualiza el dot y texto de status en el header del chat
function updateStatusUI(isOnline) {
    var dot = chatHeader.querySelector('.status-dot');
    var statusEl = chatHeader.querySelector('.chat-status');
    if (!dot || !statusEl) return;
    if (isOnline) {
        dot.classList.add('online');
        statusEl.classList.add('online');
        statusEl.textContent = 'En línea';
    } else {
        dot.classList.remove('online');
        statusEl.classList.remove('online');
        statusEl.textContent = 'Desconectado';
    }
}

// --- sistema de dropdown ---

var msgDropdown = document.createElement('div');
msgDropdown.className = 'msg-dropdown';
document.body.appendChild(msgDropdown);

function posDropdown(anchor) {
    var rect = anchor.getBoundingClientRect();
    msgDropdown.style.visibility = 'hidden';
    msgDropdown.style.display = 'block';
    var ddH = msgDropdown.offsetHeight;
    var ddW = msgDropdown.offsetWidth;
    msgDropdown.style.display = '';
    msgDropdown.style.visibility = '';
    var top = rect.bottom + 4;
    var left = rect.right - ddW;
    if (top + ddH > window.innerHeight - 8) top = rect.top - ddH - 4;
    if (left < 8) left = rect.left;
    if (left + ddW > window.innerWidth - 8) left = window.innerWidth - ddW - 8;
    msgDropdown.style.top = top + 'px';
    msgDropdown.style.left = left + 'px';
}

function posDropdownAt(x, y) {
    msgDropdown.style.visibility = 'hidden';
    msgDropdown.style.display = 'block';
    var ddH = msgDropdown.offsetHeight;
    var ddW = msgDropdown.offsetWidth;
    msgDropdown.style.display = '';
    msgDropdown.style.visibility = '';
    var top = y, left = x;
    if (top + ddH > window.innerHeight - 8) top = y - ddH;
    if (left + ddW > window.innerWidth - 8) left = window.innerWidth - ddW - 8;
    if (left < 8) left = 8;
    msgDropdown.style.top = top + 'px';
    msgDropdown.style.left = left + 'px';
}

function openDropdown(anchor, items) {
    var actions = [];
    var html = '';
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        if (item.divider) { html += '<div class="msg-dropdown-divider"></div>'; continue; }
        var cls = item.cls ? ' ' + item.cls : '';
        html += '<div class="msg-dropdown-item' + cls + '" data-action="' + actions.length + '">';
        if (item.icon) html += '<i data-lucide="' + item.icon + '"></i>';
        html += item.label + '</div>';
        actions.push(item.action || null);
    }
    msgDropdown.innerHTML = html;
    posDropdown(anchor);
    msgDropdown.classList.add('show');
    lucide.createIcons({ nodes: [msgDropdown] });
    msgDropdown.querySelectorAll('.msg-dropdown-item').forEach(function(el) {
        el.addEventListener('click', function(e) {
            e.stopPropagation();
            var idx = parseInt(el.getAttribute('data-action'));
            closeDropdown(actions[idx] || null);
        });
    });
}

function closeDropdown(cb) {
    if (!msgDropdown.classList.contains('show')) { if (cb) cb(); return; }
    msgDropdown.classList.remove('show');
    msgDropdown.classList.add('closing');
    msgDropdown.addEventListener('animationend', function handler() {
        msgDropdown.removeEventListener('animationend', handler);
        msgDropdown.classList.remove('closing');
        if (cb) cb();
    });
}

function openAttachPopup() {
    attachPopup.classList.remove('closing');
    attachPopup.classList.add('show');
    lucide.createIcons({ nodes: [attachPopup] });
}

function closeAttachPopup(cb) {
    if (!attachPopup.classList.contains('show')) { if (cb) cb(); return; }
    attachPopup.classList.remove('show');
    attachPopup.classList.add('closing');
    attachPopup.addEventListener('animationend', function handler() {
        attachPopup.removeEventListener('animationend', handler);
        attachPopup.classList.remove('closing');
        if (cb) cb();
    });
}

document.addEventListener('keydown', function(e) {
    if (e.key !== 'Escape') return;
    if (newConvPanel.classList.contains('open')) {
        if (ncpScreen2.style.display !== 'none') {
            ncpScreen2.style.display = 'none';
            ncpScreen1.style.display = '';
            document.getElementById('ncpTitle').textContent = 'Nueva conversación';
        } else {
            closeNcp();
        }
        return;
    }
    if (attachPopup.classList.contains('show')) { closeAttachPopup(); return; }
    if (replyBar.style.display !== 'none') { cancelReply(); return; }
    if (msgDropdown.classList.contains('show')) { closeDropdown(); return; }
    if (newConvBackdrop.classList.contains('open')) { closeModal(); return; }
    if (activeConvId && window.innerWidth <= 480) { closeMobileChat(); return; }
    if (activeConvId) { closeChatPanel(); }
});

document.addEventListener('click', function(e) {
    if (msgDropdown.classList.contains('show') && !e.target.closest('.msg-dropdown')) {
        closeDropdown();
    }
    if (attachPopup.classList.contains('show') && !e.target.closest('.attach-popup') && !e.target.closest('#btnAttach')) {
        closeAttachPopup();
    }
});



function toggleConvMeta(convId, meta) {
    var fd = new FormData();
    fd.append('conv_id', convId);
    fd.append('meta', meta);
    fetch('../messages/toggle_conv_meta.php', { method: 'POST', body: fd })
        .then(function(r) { return r.json(); })
        .then(function(res) {
            if (!res.ok) return;
            var on = res.value === 1;
            var msgs = {
                pinned:   [on ? 'Conversación fijada'       : 'Fijado quitado'],
                favorite: [on ? 'Añadido a favoritos'       : 'Eliminado de favoritos'],
                muted:    [on ? 'Conversación silenciada'   : 'Notificaciones activadas'],
            };
            message.success(msgs[meta][0]);
            loadConversations();
        });
}

function getConvMenuItems(convId) {
    var conv = null;
    for (var i = 0; i < conversations.length; i++) {
        if (conversations[i].id == convId) { conv = conversations[i]; break; }
    }
    var pinned = conv && conv.is_pinned == 1;
    var muted  = conv && conv.is_muted  == 1;
    var fav    = conv && conv.is_favorite == 1;
    return [
        { icon: 'pin',      label: pinned ? 'Quitar fijado'   : 'Fijar',    action: function() { toggleConvMeta(convId, 'pinned'); } },
        { icon: 'bell-off', label: muted  ? 'Activar sonido'  : 'Silenciar',action: function() { toggleConvMeta(convId, 'muted'); } },
        { icon: 'mail',     label: 'Marcar no leído',                        action: function() { message.tip('Próximamente'); } },
        { icon: 'star',     label: fav    ? 'Quitar favorito' : 'Favorito', action: function() { toggleConvMeta(convId, 'favorite'); } },
        { divider: true },
        { icon: 'x',        label: 'Cerrar chat',                            action: function() { closeChatPanel(); } },
        { icon: 'shield',   label: 'Bloquear',   cls: 'danger',             action: function() { message.tip('Próximamente'); } },
        { icon: 'trash-2',  label: 'Eliminar',   cls: 'danger',             action: function() { message.tip('Próximamente'); } }
    ];
}

function getHeaderMenuItems() {
    return [
        { icon: 'bookmark', label: 'Mensajes destacados', action: function() { message.tip('Próximamente'); } },
        { icon: 'check-square', label: 'Seleccionar mensajes', action: function() { message.tip('Próximamente'); } },
        { icon: 'bell-off', label: 'Silenciar', action: function() { message.tip('Próximamente'); } },
        { icon: 'user', label: 'Info contacto', action: function() { message.tip('Próximamente'); } },
        { divider: true },
        { icon: 'x', label: 'Cerrar chat', action: function() { closeChatPanel(); } },
        { icon: 'flag', label: 'Reportar', action: function() { message.tip('Próximamente'); } },
        { icon: 'shield', label: 'Bloquear', cls: 'danger', action: function() { message.tip('Próximamente'); } },
        { divider: true },
        { icon: 'trash', label: 'Vaciar chat', cls: 'danger', action: function() { message.tip('Próximamente'); } },
        { icon: 'trash-2', label: 'Eliminar chat', cls: 'danger', action: function() { message.tip('Próximamente'); } }
    ];
}

function getMsgMenuItems(isMine, text, msgId, senderName) {
    var copy = { icon: 'copy', label: 'Copiar', action: function() {
        navigator.clipboard.writeText(text).then(function() { message.success('Copiado'); });
    }};
    var base = [
        { icon: 'reply', label: 'Responder', action: function() { activateReply(msgId, text, senderName); } },
        copy,
        { icon: 'forward', label: 'Reenviar', action: function() { message.tip('Próximamente'); } },
        { icon: 'pin', label: 'Fijar', action: function() { message.tip('Próximamente'); } },
        { icon: 'bookmark', label: 'Destacar', action: function() { message.tip('Próximamente'); } },
        { divider: true }
    ];
    if (isMine) {
        base.push({ icon: 'info', label: 'Info', action: function() { message.tip('Próximamente'); } });
        base.push({ icon: 'check-square', label: 'Seleccionar', action: function() { message.tip('Próximamente'); } });
    } else {
        base.push({ icon: 'check-square', label: 'Seleccionar', action: function() { message.tip('Próximamente'); } });
        base.push({ icon: 'flag', label: 'Reportar', action: function() { message.tip('Próximamente'); } });
    }
    base.push({ divider: true });
    base.push({ icon: 'trash-2', label: 'Eliminar', cls: 'danger', action: function() { message.tip('Próximamente'); } });
    return base;
}

function closeChatPanel() {
    if (pollInterval) { clearInterval(pollInterval); pollInterval = null; }
    activeConvId = null;
    convList.querySelectorAll('.conv-item').forEach(function(el) {
        el.classList.remove('active');
    });
    chatActive.classList.remove('chat-area-opening');
    chatActive.classList.add('chat-area-closing');
    chatActive.addEventListener('animationend', function h() {
        chatActive.removeEventListener('animationend', h);
        chatActive.classList.remove('chat-area-closing');
        chatActive.style.display = 'none';
        chatEmpty.style.display = '';
    });
}

function loadConversations() {
    fetch('../messages/get_conversations.php')
        .then(function(r) { return r.json(); })
        .then(function(res) {
            if (!res.ok) return;
            conversations = res.conversations;
            renderConvList(convSearch.value);
        });
}

// --- render lista conversaciones ---

function renderConvList(filter) {
    filter = (filter || '').toLowerCase();
    var filtered = conversations.filter(function(c) {
        return !filter || (c.other_name && c.other_name.toLowerCase().indexOf(filter) >= 0);
    });

    if (activeFilter === 'unread') {
        filtered = filtered.filter(function(c) { return parseInt(c.unread) > 0; });
    } else if (activeFilter === 'favorites') {
        filtered = filtered.filter(function(c) { return c.is_favorite == 1; });
    }

    if (filtered.length === 0) {
        var emptyMsg = activeFilter === 'favorites' ? 'Sin favoritos' : activeFilter === 'unread' ? 'Sin mensajes no leídos' : 'Sin conversaciones';
        convList.innerHTML = '<div class="conv-empty">' + emptyMsg + '</div>';
        return;
    }

    // fijadas primero, luego por fecha (orden ya viene del servidor)
    filtered.sort(function(a, b) { return (b.is_pinned == 1 ? 1 : 0) - (a.is_pinned == 1 ? 1 : 0); });

    var html = '';
    var shownPinSep = false, shownRegSep = false;
    var hasPinned = filtered.some(function(c) { return c.is_pinned == 1; });

    for (var i = 0; i < filtered.length; i++) {
        var c = filtered[i];
        var name = c.other_name || 'Usuario';
        var color = avatarColor(name);
        var ini = initials(name);
        var unread = parseInt(c.unread) || 0;
        var lastMsg = c.last_msg ? c.last_msg.slice(0, 36) + (c.last_msg.length > 36 ? '…' : '') : 'Sin mensajes';
        var time = formatTime(c.last_time);
        var isActive = c.id == activeConvId ? ' active' : '';

        if (hasPinned && c.is_pinned == 1 && !shownPinSep) {
            html += '<div class="conv-sep"><i data-lucide="pin"></i> Fijadas</div>';
            shownPinSep = true;
        }
        if (hasPinned && c.is_pinned != 1 && !shownRegSep) {
            html += '<div class="conv-sep">Recientes</div>';
            shownRegSep = true;
        }

        var flags = '';
        if (c.is_pinned == 1)   flags += '<i data-lucide="pin" class="conv-flag"></i>';
        if (c.is_favorite == 1) flags += '<i data-lucide="star" class="conv-flag fav"></i>';
        if (c.is_muted == 1)    flags += '<i data-lucide="bell-off" class="conv-flag muted"></i>';

        html += '<div class="conv-item' + isActive + '" data-id="' + c.id + '" data-name="' + encodeURIComponent(name) + '">';
        html += '<div class="conv-avatar" style="background:' + color + '">' + ini + '</div>';
        html += '<div class="conv-info">';
        html += '<div class="conv-name">' + escapeHtml(name) + (flags ? '<span class="conv-flags">' + flags + '</span>' : '') + '</div>';
        html += '<div class="conv-last">' + escapeHtml(lastMsg) + '</div>';
        html += '</div>';
        html += '<div class="conv-meta">';
        if (time) html += '<span class="conv-time">' + time + '</span>';
        if (unread > 0) html += '<span class="conv-badge">' + unread + '</span>';
        html += '</div>';
        html += '<button class="conv-actions-trigger" aria-label="Acciones"><i data-lucide="chevron-down"></i></button>';
        html += '</div>';
    }
    convList.innerHTML = html;

    convList.querySelectorAll('.conv-item').forEach(function(el) {
        el.addEventListener('click', function(e) {
            if (e.target.closest('.conv-actions-trigger')) return;
            openConversation(parseInt(el.getAttribute('data-id')), decodeURIComponent(el.getAttribute('data-name')));
        });
    });

    lucide.createIcons({ nodes: [convList] });
}

// acciones en conversaciones
convList.addEventListener('click', function(e) {
    var trigger = e.target.closest('.conv-actions-trigger');
    if (!trigger) return;
    e.stopPropagation();
    var convItem = trigger.closest('.conv-item');
    var convId = parseInt(convItem.getAttribute('data-id'));
    openDropdown(trigger, getConvMenuItems(convId));
});

convList.addEventListener('contextmenu', function(e) {
    var convItem = e.target.closest('.conv-item');
    if (!convItem) return;
    e.preventDefault();
    var convId = parseInt(convItem.getAttribute('data-id'));
    openDropdown(convItem, getConvMenuItems(convId));
    posDropdownAt(e.clientX, e.clientY);
});

// menu header del chat
chatHeader.addEventListener('click', function(e) {
    var btn = e.target.closest('.btn-chat-more');
    if (!btn) return;
    e.stopPropagation();
    openDropdown(btn, getHeaderMenuItems());
});

function getBubbleText(bubble) {
    var textEl = bubble.querySelector('.msg-text');
    var t = textEl ? textEl.textContent.trim() : '';
    if (t) return t;
    if (bubble.querySelector('.msg-img'))           return '📷 Imagen';
    if (bubble.querySelector('.msg-attachment'))     return '📎 Archivo';
    if (bubble.querySelector('.attach-location'))   return '📍 Ubicación';
    if (bubble.querySelector('audio'))              return '🎵 Audio';
    if (bubble.querySelector('.attach-contact'))    return '👤 Contacto';
    return '📎 Adjunto';
}

// click derecho en burbujas
chatMessages.addEventListener('contextmenu', function(e) {
    var bubble = e.target.closest('.msg-bubble');
    if (!bubble) return;
    e.preventDefault();
    var row = bubble.closest('.msg-row');
    var isMine = row.classList.contains('mine');
    var text = getBubbleText(bubble);
    var msgId = parseInt(row.getAttribute('data-msg-id')) || 0;
    var senderName = isMine ? 'Tú' : (activeConvName || 'Ellos');
    openDropdown(bubble, getMsgMenuItems(isMine, text, msgId, senderName));
    posDropdownAt(e.clientX, e.clientY);
});

chatMessages.addEventListener('dblclick', function(e) {
    var bubble = e.target.closest('.msg-bubble');
    if (!bubble) return;
    var row = bubble.closest('.msg-row');
    var isMine = row.classList.contains('mine');
    var text = getBubbleText(bubble);
    var msgId = parseInt(row.getAttribute('data-msg-id')) || 0;
    var senderName = isMine ? 'Tú' : (activeConvName || 'Ellos');
    activateReply(msgId, text, senderName);
});

// chevron button + click en reply-preview
chatMessages.addEventListener('click', function(e) {
    var btn = e.target.closest('.msg-actions-btn');
    if (btn) {
        e.stopPropagation();
        var row = btn.closest('.msg-row');
        var bubble = row.querySelector('.msg-bubble');
        var isMine = row.classList.contains('mine');
        var text = getBubbleText(bubble);
        var msgId = parseInt(row.getAttribute('data-msg-id')) || 0;
        var senderName = isMine ? 'Tú' : (activeConvName || 'Ellos');
        openDropdown(btn, getMsgMenuItems(isMine, text, msgId, senderName));
        return;
    }
    var preview = e.target.closest('.reply-preview');
    if (!preview) return;
    var targetId = preview.getAttribute('data-reply-to');
    if (!targetId) return;
    var targetRow = chatMessages.querySelector('[data-msg-id="' + targetId + '"]');
    if (!targetRow) return;
    targetRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
    var bub = targetRow.querySelector('.msg-bubble');
    if (!bub) return;
    bub.classList.remove('reply-source-flash');
    void bub.offsetWidth;
    bub.classList.add('reply-source-flash');
    bub.addEventListener('animationend', function h() {
        bub.removeEventListener('animationend', h);
        bub.classList.remove('reply-source-flash');
    });
});

// swipe derecho para responder (móvil) + long-press para menú
var swipeRow = null, swipeX = 0, swipeY = 0, swipeDone = false;
var longPressTimer = null, longPressRow = null, longPressX = 0, longPressY = 0;
chatMessages.addEventListener('touchstart', function(e) {
    var bub = e.target.closest('.msg-bubble');
    if (!bub) return;
    swipeRow = bub.closest('.msg-row');
    swipeX = e.touches[0].clientX;
    swipeY = e.touches[0].clientY;
    swipeDone = false;
    longPressRow = swipeRow;
    longPressX = swipeX;
    longPressY = swipeY;
    longPressTimer = setTimeout(function() {
        longPressTimer = null;
        if (!longPressRow) return;
        var row = longPressRow;
        swipeRow = null; longPressRow = null;
        var isMine = row.classList.contains('mine');
        var srcBub = row.querySelector('.msg-bubble');
        var text = srcBub ? getBubbleText(srcBub) : '';
        var msgId = parseInt(row.getAttribute('data-msg-id')) || 0;
        var senderName = isMine ? 'Tú' : (activeConvName || 'Ellos');
        openDropdown(srcBub, getMsgMenuItems(isMine, text, msgId, senderName));
        posDropdownAt(longPressX, longPressY);
    }, 500);
}, { passive: true });
chatMessages.addEventListener('touchmove', function(e) {
    if (!swipeRow) return;
    var dx = e.touches[0].clientX - swipeX;
    var dy = e.touches[0].clientY - swipeY;
    if ((Math.abs(dx) > 10 || Math.abs(dy) > 10) && longPressTimer) {
        clearTimeout(longPressTimer); longPressTimer = null;
    }
    if (Math.abs(dy) > Math.abs(dx) + 8 || dx < 0) { swipeRow = null; return; }
    var bub = swipeRow.querySelector('.msg-bubble');
    if (!bub) return;
    var move = Math.min(dx * 0.55, 54);
    bub.style.transform = 'translateX(' + move + 'px)';
    bub.style.transition = 'none';
    var hit = dx >= 52;
    swipeRow.classList.toggle('swipe-reply-hint', hit);
    swipeDone = hit;
}, { passive: true });
chatMessages.addEventListener('touchend', function() {
    if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; }
    longPressRow = null;
    if (!swipeRow) return;
    var bub = swipeRow.querySelector('.msg-bubble');
    if (bub) {
        bub.style.transition = 'transform 0.22s cubic-bezier(0.22,1,0.36,1)';
        bub.style.transform = '';
        setTimeout(function() { if (bub) bub.style.transition = ''; }, 240);
    }
    swipeRow.classList.remove('swipe-reply-hint');
    if (swipeDone) {
        var isMine = swipeRow.classList.contains('mine');
        var srcBub = swipeRow.querySelector('.msg-bubble');
        var text = srcBub ? getBubbleText(srcBub) : '';
        var msgId = parseInt(swipeRow.getAttribute('data-msg-id')) || 0;
        var senderName = isMine ? 'Tú' : (activeConvName || 'Ellos');
        activateReply(msgId, text, senderName);
    }
    swipeRow = null; swipeDone = false;
});

// --- abrir conversacion ---

function openConversation(convId, name) {
    // limpiar polling anterior
    if (pollInterval) { clearInterval(pollInterval); pollInterval = null; }
    lastMsgId = 0;
    activeConvId = convId;
    activeConvName = name;
    cancelReply();

    convList.querySelectorAll('.conv-item').forEach(function(el) {
        el.classList.toggle('active', parseInt(el.getAttribute('data-id')) === convId);
    });

    // limpiar badge unread en data local
    for (var i = 0; i < conversations.length; i++) {
        if (conversations[i].id == convId) conversations[i].unread = 0;
    }

    // marcar leidos en backend
    var mrFd = new FormData();
    mrFd.append('conv_id', convId);
    fetch('../messages/mark_read.php', { method: 'POST', body: mrFd });

    // header con nueva estructura
    var color = avatarColor(name);
    var ini = initials(name);
    chatHeader.innerHTML =
        '<div class="conv-avatar-wrap">' +
          '<div class="conv-avatar" style="background:' + color + ';width:36px;height:36px;font-size:12px;">' + ini + '</div>' +
          '<span class="status-dot"></span>' +
        '</div>' +
        '<div class="chat-header-info">' +
          '<span class="chat-name">' + escapeHtml(name) + '</span>' +
          '<span class="chat-status">Desconectado</span>' +
        '</div>' +
        '<div class="chat-header-actions">' +
          '<button class="btn-chat-action" aria-label="Llamar"><i data-lucide="phone"></i></button>' +
          '<button class="btn-chat-action" aria-label="Video"><i data-lucide="video"></i></button>' +
          '<button class="btn-chat-action btn-chat-more" aria-label="Más opciones"><i data-lucide="more-vertical"></i></button>' +
        '</div>';

    // status inicial desde convData (puede estar un poco desactualizado, el poll lo refresca)
    for (var ci = 0; ci < conversations.length; ci++) {
        if (conversations[ci].id == convId) {
            updateStatusUI(parseInt(conversations[ci].is_online));
            break;
        }
    }

    // mobile: esconder lista, mostrar chat
    if (window.innerWidth <= 480) {
        document.querySelector('.conv-panel').classList.add('hidden');
        document.querySelector('.chat-panel').classList.add('mobile-active');
        var bnav = document.querySelector('.bottom-nav');
        if (bnav) bnav.style.display = 'none';
        if (!document.getElementById('btnBack')) {
            var btn = document.createElement('button');
            btn.id = 'btnBack';
            btn.className = 'btn-back-mobile';
            btn.setAttribute('aria-label', 'Volver');
            btn.innerHTML = '<i data-lucide="arrow-left"></i>';
            btn.addEventListener('click', closeMobileChat);
            chatHeader.insertBefore(btn, chatHeader.firstChild);
        }
    }

    chatEmpty.style.display = 'none';
    chatActive.style.display = 'flex';
    chatActive.classList.remove('chat-area-opening');
    void chatActive.offsetWidth;
    chatActive.classList.add('chat-area-opening');
    chatMessages.innerHTML = '<div class="msgs-loading"><span></span><span></span><span></span></div>';

    fetch('../messages/get_messages.php?conv_id=' + convId)
        .then(function(r) { return r.json(); })
        .then(function(res) {
            if (!res.ok) { chatMessages.innerHTML = '<p style="color:var(--text-muted);text-align:center;font-size:12px;">Error al cargar</p>'; return; }
            renderMessages(res.messages);
            scrollToBottom();
            updateStatusUI(res.is_online);
            // guardar ultimo id y arrancar polling
            if (res.messages.length) lastMsgId = parseInt(res.messages[res.messages.length - 1].id);
            pollInterval = setInterval(pollMessages, 5000);
            lucide.createIcons();
        })
        .catch(function() {
            chatMessages.innerHTML = '<p style="color:var(--text-muted);text-align:center;font-size:12px;">Error de conexión</p>';
        });
}

function closeMobileChat() {
    if (pollInterval) { clearInterval(pollInterval); pollInterval = null; }
    activeConvId = null;
    lastMsgId = 0;
    var btn = document.getElementById('btnBack');
    if (btn) btn.remove();
    chatActive.classList.remove('chat-area-opening');
    chatActive.classList.add('chat-area-closing');
    chatActive.addEventListener('animationend', function h() {
        chatActive.removeEventListener('animationend', h);
        chatActive.classList.remove('chat-area-closing');
        chatActive.style.display = 'none';
        chatEmpty.style.display = '';
        document.querySelector('.conv-panel').classList.remove('hidden');
        document.querySelector('.chat-panel').classList.remove('mobile-active');
        var bnav = document.querySelector('.bottom-nav');
        if (bnav) bnav.style.display = '';
    });
}

// polling para mensajes nuevos en el chat activo
function pollMessages() {
    if (!activeConvId) return;
    fetch('../messages/get_messages.php?conv_id=' + activeConvId)
        .then(function(r) { return r.json(); })
        .then(function(res) {
            if (!res.ok) return;
            if (res.is_online !== undefined) updateStatusUI(res.is_online);
            if (!res.messages || !res.messages.length) return;
            var msgs = res.messages;
            var newestId = parseInt(msgs[msgs.length - 1].id);
            if (newestId <= lastMsgId) return;
            // hay mensajes nuevos
            lastMsgId = newestId;
            var wasAtBottom = chatMessages.scrollHeight - chatMessages.scrollTop - chatMessages.clientHeight < 60;
            renderMessages(msgs);
            if (wasAtBottom) scrollToBottom();
            loadConversations();
            // marcar leidos automatico
            var fd = new FormData();
            fd.append('conv_id', activeConvId);
            fetch('../messages/mark_read.php', { method: 'POST', body: fd });
        })
        .catch(function() {});
}

// --- render mensajes ---

function renderMessages(msgs) {
    if (!msgs || msgs.length === 0) {
        chatMessages.innerHTML = '<div class="msgs-empty"><i data-lucide="message-circle-dashed"></i><p>No hay mensajes aún</p></div>';
        lucide.createIcons();
        return;
    }

    var html = '';
    var lastDate = null;

    for (var i = 0; i < msgs.length; i++) {
        var m = msgs[i];
        var isMine = parseInt(m.sender_id) === currentUid;
        var d = new Date(m.created_at);
        var dateStr = d.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' });

        if (dateStr !== lastDate) {
            html += '<div class="msg-date-sep"><span>' + dateStr + '</span></div>';
            lastDate = dateStr;
        }

        var cls = isMine ? 'msg-row mine' : 'msg-row theirs';
        html += '<div class="' + cls + '" data-msg-id="' + m.id + '">';
        if (isMine) html += '<button class="msg-actions-btn" aria-label="Opciones"><i data-lucide="chevron-down"></i></button>';
        html += '<div class="msg-bubble">';
        if (m.reply_to_id) {
            var rSender = parseInt(m.reply_sender_id) === currentUid ? 'Tú' : (activeConvName || 'Ellos');
            var rBodyHtml;
            if (!m.reply_body && !m.reply_attachment_type) {
                rBodyHtml = '<span class="reply-preview-body reply-deleted">Mensaje eliminado</span>';
            } else if (!m.reply_body) {
                var attLabel = m.reply_attachment_type === 'image' ? '📷 Imagen' : '📎 Archivo';
                rBodyHtml = '<span class="reply-preview-body">' + attLabel + '</span>';
            } else {
                rBodyHtml = '<span class="reply-preview-body">' + escapeHtml(m.reply_body) + '</span>';
            }
            html += '<div class="reply-preview" data-reply-to="' + m.reply_to_id + '">';
            html += '<span class="reply-preview-sender">' + escapeHtml(rSender) + '</span>';
            html += rBodyHtml;
            html += '</div>';
        }
        if (m.body) html += '<span class="msg-text">' + escapeHtml(m.body) + '</span>';
        if (m.attachment_url) {
            if (m.attachment_type === 'image') {
                html += '<img class="msg-img" src="' + m.attachment_url + '" alt="imagen" loading="lazy">';
            } else {
                var fname = m.attachment_url.split('/').pop().replace(/^\d+_/, '');
                html += '<div class="msg-attachment">';
                html += '<span class="att-icon"><i data-lucide="file-text"></i></span>';
                html += '<div class="att-info"><div class="att-name">' + escapeHtml(fname) + '</div>';
                html += '<a class="att-size" href="' + m.attachment_url + '" target="_blank">Descargar</a>';
                html += '</div></div>';
            }
        }
        html += '<span class="msg-time">' + formatMsgTime(m.created_at) + '</span>';
        html += '</div>';
        if (!isMine) html += '<button class="msg-actions-btn" aria-label="Opciones"><i data-lucide="chevron-down"></i></button>';
        html += '</div>';
    }

    chatMessages.innerHTML = html;
    lucide.createIcons({ nodes: [chatMessages] });
}

function escapeHtml(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// --- enviar mensaje ---

function sendMessage() {
    var body = msgInput.value.trim();
    if ((!body && !pendingAttUrl) || !activeConvId) return;

    msgInput.value = '';
    msgInput.focus();

    var snapAttUrl  = pendingAttUrl;
    var snapAttType = pendingAttType;
    var snapAttName = pendingAttName;
    var snapAttSize = pendingAttSize;
    pendingAttUrl = pendingAttType = pendingAttName = null;
    pendingAttSize = 0;

    var snapReplyId = replyToId, snapReplyBody = replyToBody, snapReplySender = replyToSender;
    cancelReply();

    // render optimista
    var html = '<div class="msg-row mine"><button class="msg-actions-btn" aria-label="Opciones"><i data-lucide="chevron-down"></i></button><div class="msg-bubble">';
    if (snapReplyId) {
        html += '<div class="reply-preview reply-preview-anim" data-reply-to="' + snapReplyId + '">';
        html += '<span class="reply-preview-sender">' + escapeHtml(snapReplySender) + '</span>';
        html += '<span class="reply-preview-body">' + escapeHtml(snapReplyBody) + '</span>';
        html += '</div>';
    }
    if (body) html += '<span class="msg-text">' + escapeHtml(body) + '</span>';
    if (snapAttName) {
        if (snapAttType === 'image') {
            html += '<img class="msg-img" src="' + snapAttUrl + '" alt="imagen" loading="lazy">';
        } else {
            html += '<div class="msg-attachment">';
            html += '<span class="att-icon"><i data-lucide="file-text"></i></span>';
            html += '<div class="att-info"><div class="att-name">' + escapeHtml(snapAttName) + '</div>';
            html += '<div class="att-size">' + formatFileSize(snapAttSize) + '</div></div></div>';
        }
    }
    html += '<span class="msg-time">' + formatMsgTime(new Date().toISOString()) + '</span>';
    html += '</div></div>';
    chatMessages.insertAdjacentHTML('beforeend', html);
    lucide.createIcons({ nodes: [chatMessages.lastElementChild] });
    scrollToBottom();

    var fd = new FormData();
    fd.append('conv_id', activeConvId);
    fd.append('body', body);
    if (snapAttUrl) {
        fd.append('attachment_url', snapAttUrl);
        fd.append('attachment_type', snapAttType);
    }
    if (snapReplyId) fd.append('reply_to_id', snapReplyId);

    fetch('../messages/send_message.php', { method: 'POST', body: fd })
        .then(function(r) { return r.json(); })
        .then(function(res) {
            if (!res.ok) return;
            // respuesta inmediata: mover conv al top en memoria
            for (var i = 0; i < conversations.length; i++) {
                if (conversations[i].id == activeConvId) {
                    conversations[i].last_msg = body || '📎 Adjunto';
                    conversations[i].last_time = res.message.created_at;
                    break;
                }
            }
            renderConvList(convSearch.value);
            // sync con servidor para orden real y datos frescos
            loadConversations();
        });
}

btnSend.addEventListener('click', sendMessage);
msgInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
});

// --- buscar en lista ---

convSearch.addEventListener('input', function() {
    renderConvList(this.value);
});

document.querySelectorAll('.filter-chip').forEach(function(chip) {
    chip.addEventListener('click', function() {
        document.querySelectorAll('.filter-chip').forEach(function(c) { c.classList.remove('active'); });
        chip.classList.add('active');
        activeFilter = chip.dataset.filter;
        renderConvList(convSearch.value);
    });
});

// --- adjuntar archivo ---

document.getElementById('btnAttach').addEventListener('click', function(e) {
    e.stopPropagation();
    if (attachPopup.classList.contains('show')) {
        closeAttachPopup();
    } else {
        closeDropdown(function() { openAttachPopup(); });
    }
});

document.querySelectorAll('.attach-option').forEach(function(opt) {
    opt.addEventListener('click', function() {
        var action = this.dataset.action;
        closeAttachPopup(function() {
            if (action === 'photos') {
                fileInput.accept = 'image/*';
                fileInput.click();
            } else if (action === 'document') {
                fileInput.accept = '.pdf,.doc,.docx,.xls,.xlsx,.zip,.rar';
                fileInput.click();
            } else {
                message.warning('Próximamente');
            }
        });
    });
});

fileInput.addEventListener('change', function() {
    var f = fileInput.files[0];
    fileInput.value = '';
    fileInput.accept = 'image/*,.pdf,.doc,.docx,.zip';
    if (!f || !activeConvId) return;

    var fd = new FormData();
    fd.append('file', f);
    message.tip('Subiendo archivo...');
    btnSend.disabled = true;

    fetch('../messages/upload_attachment.php', { method: 'POST', body: fd })
        .then(function(r) { return r.json(); })
        .then(function(res) {
            btnSend.disabled = false;
            if (!res.ok) { message.error(res.error || 'Error al subir'); return; }
            pendingAttUrl  = res.url;
            pendingAttType = res.type;
            pendingAttName = res.name;
            pendingAttSize = res.size;
            sendMessage();
        })
        .catch(function() { btnSend.disabled = false; message.error('Error de red'); });
});

// --- panel nueva conversacion ---

function openNcp() {
    ncpScreen1.style.display = '';
    ncpScreen2.style.display = 'none';
    document.getElementById('ncpTitle').textContent = 'Nueva conversación';
    newConvPanel.classList.remove('closing');
    newConvPanel.classList.add('open');
    lucide.createIcons({ nodes: [newConvPanel] });
}

function closeNcp(cb) {
    if (!newConvPanel.classList.contains('open')) { if (cb) cb(); return; }
    newConvPanel.classList.remove('open');
    newConvPanel.classList.add('closing');
    newConvPanel.addEventListener('animationend', function h() {
        newConvPanel.removeEventListener('animationend', h);
        newConvPanel.classList.remove('closing');
        if (cb) cb();
    });
}

btnNewConv.addEventListener('click', function() { openNcp(); });

ncpBack.addEventListener('click', function() {
    if (ncpScreen2.style.display !== 'none') {
        ncpScreen2.style.display = 'none';
        ncpScreen1.style.display = '';
        document.getElementById('ncpTitle').textContent = 'Nueva conversación';
    } else {
        closeNcp();
    }
});

document.querySelector('[data-ncp="search"]').addEventListener('click', function() {
    ncpScreen1.style.display = 'none';
    ncpScreen2.style.display = '';
    document.getElementById('ncpTitle').textContent = 'Buscar usuario';
    setTimeout(function() { ncpUserSearch.focus(); }, 50);
});

var ncpTimer = null;
ncpUserSearch.addEventListener('input', function() {
    clearTimeout(ncpTimer);
    var q = this.value.trim();
    if (q.length < 2) { ncpResults.innerHTML = ''; return; }
    ncpTimer = setTimeout(function() {
        fetch('../messages/search_users.php?q=' + encodeURIComponent(q))
            .then(function(r) { return r.json(); })
            .then(function(res) {
                if (!res.ok || !res.users.length) {
                    ncpResults.innerHTML = '<div class="ncp-user-item" style="color:var(--text-muted)">Sin resultados</div>';
                    return;
                }
                ncpResults.innerHTML = res.users.map(function(u) {
                    return '<div class="ncp-user-item" data-uid="' + u.id + '">' + escapeHtml(u.name) + '</div>';
                }).join('');
            });
    }, 250);
});

ncpResults.addEventListener('click', function(e) {
    var item = e.target.closest('.ncp-user-item[data-uid]');
    if (!item) return;
    closeNcp(function() { startConversation(parseInt(item.dataset.uid)); });
});

// --- modal nueva conversacion (fallback) ---

btnCloseModal.addEventListener('click', closeModal);
newConvBackdrop.addEventListener('click', function(e) {
    if (e.target === newConvBackdrop) closeModal();
});

function closeModal() {
    var box = newConvBackdrop.querySelector('.modal-box');
    if (!box) { newConvBackdrop.classList.remove('open'); return; }
    box.classList.add('closing');
    box.addEventListener('animationend', function handler() {
        box.removeEventListener('animationend', handler);
        box.classList.remove('closing');
        newConvBackdrop.classList.remove('open');
    });
}

var searchTimer = null;
userSearch.addEventListener('input', function() {
    clearTimeout(searchTimer);
    var q = this.value.trim();
    if (q.length < 2) { userResults.innerHTML = ''; return; }
    searchTimer = setTimeout(function() {
        fetch('../messages/search_users.php?q=' + encodeURIComponent(q))
            .then(function(r) { return r.json(); })
            .then(function(res) {
                if (!res.ok || !res.users.length) {
                    userResults.innerHTML = '<div style="padding:8px 10px;font-size:12px;color:var(--text-muted);">Sin resultados</div>';
                    return;
                }
                var html = '';
                for (var i = 0; i < res.users.length; i++) {
                    var u = res.users[i];
                    html += '<div class="user-result-item" data-uid="' + u.id + '">' + escapeHtml(u.name) + '</div>';
                }
                userResults.innerHTML = html;
                userResults.querySelectorAll('.user-result-item').forEach(function(el) {
                    el.addEventListener('click', function() {
                        startConversation(parseInt(el.getAttribute('data-uid')));
                    });
                });
            });
    }, 250);
});

function startConversation(userId) {
    var fd = new FormData();
    fd.append('user_id', userId);
    fetch('../messages/new_conversation.php', { method: 'POST', body: fd })
        .then(function(r) { return r.json(); })
        .then(function(res) {
            if (!res.ok) return;
            var conv = res.conversation;
            // si ya existe en la lista, solo abrir
            var exists = false;
            for (var i = 0; i < conversations.length; i++) {
                if (conversations[i].id == conv.id) { exists = true; break; }
            }
            if (!exists) {
                conversations.unshift(conv);
            }
            closeModal();
            renderConvList('');
            convSearch.value = '';
            openConversation(conv.id, conv.other_name);
        });
}

// --- heartbeat last_seen ---

fetch('../messages/update_last_seen.php', { method: 'POST' });
setInterval(function() {
    fetch('../messages/update_last_seen.php', { method: 'POST' });
}, 30000);

// actualizar lista de convs en background (cubre convs inactivas)
setInterval(loadConversations, 10000);

// --- init ---

renderConvList('');
lucide.createIcons();
