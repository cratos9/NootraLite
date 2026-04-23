var replyBar       = document.getElementById('replyBar');
var replyBarSender = document.getElementById('replyBarSender');
var replyBarBody   = document.getElementById('replyBarBody');
var replyBarClose  = document.getElementById('replyBarClose');
var attachPopup    = document.getElementById('attachPopup');
var fileInput      = document.getElementById('fileInput');
var chatEmpty      = document.getElementById('chatEmpty');
var chatActive     = document.getElementById('chatActive');
var chatHeader     = document.getElementById('chatHeader');
var chatMessages   = document.getElementById('chatMessages');

var swipeRow = null, swipeX = 0, swipeY = 0, swipeDone = false;
var longPressTimer = null, longPressRow = null, longPressX = 0, longPressY = 0;

var msgDropdown = document.createElement('div');
msgDropdown.className = 'msg-dropdown';
document.body.appendChild(msgDropdown);

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

function getConvMenuItems(convId) {
    var conv = null;
    for (var i = 0; i < conversations.length; i++) {
        if (conversations[i].id == convId) { conv = conversations[i]; break; }
    }
    var pinned = conv && conv.is_pinned == 1;
    var muted  = conv && conv.is_muted  == 1;
    var fav    = conv && conv.is_favorite == 1;
    return [
        { icon: 'pin',      label: pinned ? 'Quitar fijado'   : 'Fijar',     action: function() { toggleConvMeta(convId, 'pinned'); } },
        { icon: 'bell-off', label: muted  ? 'Activar sonido'  : 'Silenciar', action: function() { toggleConvMeta(convId, 'muted'); } },
        { icon: 'mail',     label: 'Marcar no leído',                         action: function() { message.tip('Próximamente'); } },
        { icon: 'star',     label: fav    ? 'Quitar favorito' : 'Favorito',  action: function() { toggleConvMeta(convId, 'favorite'); } },
        { divider: true },
        { icon: 'x',        label: 'Cerrar chat',                             action: function() { closeChatPanel(); } },
        { icon: 'shield',   label: 'Bloquear',   cls: 'danger',              action: function() { message.tip('Próximamente'); } },
        { icon: 'trash-2',  label: 'Eliminar',   cls: 'danger',              action: function() { message.tip('Próximamente'); } }
    ];
}

function getHeaderMenuItems() {
    return [
        { icon: 'bookmark',     label: 'Mensajes destacados',  action: function() { message.tip('Próximamente'); } },
        { icon: 'check-square', label: 'Seleccionar mensajes', action: function() { message.tip('Próximamente'); } },
        { icon: 'bell-off',     label: 'Silenciar',            action: function() { message.tip('Próximamente'); } },
        { icon: 'user',         label: 'Info contacto',        action: function() { message.tip('Próximamente'); } },
        { divider: true },
        { icon: 'x',            label: 'Cerrar chat',          action: function() { closeChatPanel(); } },
        { icon: 'flag',         label: 'Reportar',             action: function() { message.tip('Próximamente'); } },
        { icon: 'shield',       label: 'Bloquear', cls: 'danger', action: function() { message.tip('Próximamente'); } },
        { divider: true },
        { icon: 'trash',        label: 'Vaciar chat',   cls: 'danger', action: function() { message.tip('Próximamente'); } },
        { icon: 'trash-2',      label: 'Eliminar chat', cls: 'danger', action: function() { message.tip('Próximamente'); } }
    ];
}

function getMsgMenuItems(isMine, text, msgId, senderName) {
    var copy = { icon: 'copy', label: 'Copiar', action: function() {
        navigator.clipboard.writeText(text).then(function() { message.success('Copiado'); });
    }};
    var base = [
        { icon: 'reply',    label: 'Responder', action: function() { activateReply(msgId, text, senderName); } },
        copy,
        { icon: 'forward',  label: 'Reenviar',  action: function() { message.tip('Próximamente'); } },
        { icon: 'pin',      label: 'Fijar',     action: function() { message.tip('Próximamente'); } },
        { icon: 'bookmark', label: 'Destacar',  action: function() { message.tip('Próximamente'); } },
        { divider: true }
    ];
    if (isMine) {
        base.push({ icon: 'info',         label: 'Info',        action: function() { message.tip('Próximamente'); } });
        base.push({ icon: 'check-square', label: 'Seleccionar', action: function() { message.tip('Próximamente'); } });
    } else {
        base.push({ icon: 'check-square', label: 'Seleccionar', action: function() { message.tip('Próximamente'); } });
        base.push({ icon: 'flag',         label: 'Reportar',    action: function() { message.tip('Próximamente'); } });
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
