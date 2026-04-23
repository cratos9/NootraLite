var conversations = convData || [];
var activeConvId  = null;
var activeFilter  = 'all';
var activeConvName = null;

var msgInput = document.getElementById('msgInput');
var btnSend  = document.getElementById('btnSend');

var pendingAttUrl  = null;
var pendingAttType = null;
var pendingAttName = null;
var pendingAttSize = 0;

var pollInterval = null;
var lastMsgId    = 0;
var replyToId = null, replyToBody = null, replyToSender = null;

function getBubbleText(bubble) {
    var textEl = bubble.querySelector('.msg-text');
    var t = textEl ? textEl.textContent.trim() : '';
    if (t) return t;
    if (bubble.querySelector('.msg-img'))         return '📷 Imagen';
    if (bubble.querySelector('.msg-attachment'))  return '📎 Archivo';
    if (bubble.querySelector('.attach-location')) return '📍 Ubicación';
    if (bubble.querySelector('audio'))            return '🎵 Audio';
    if (bubble.querySelector('.attach-contact'))  return '👤 Contacto';
    return '📎 Adjunto';
}

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

function openConversation(convId, name) {
    if (pollInterval) { clearInterval(pollInterval); pollInterval = null; }
    lastMsgId = 0;
    activeConvId = convId;
    activeConvName = name;
    cancelReply();

    convList.querySelectorAll('.conv-item').forEach(function(el) {
        el.classList.toggle('active', parseInt(el.getAttribute('data-id')) === convId);
    });

    for (var i = 0; i < conversations.length; i++) {
        if (conversations[i].id == convId) {
            conversations[i].unread = 0;
            conversations[i].force_unread = 0;
            break;
        }
    }

    var mrFd = new FormData();
    mrFd.append('conv_id', convId);
    fetch('../messages/mark_read.php', { method: 'POST', body: mrFd });

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

    for (var ci = 0; ci < conversations.length; ci++) {
        if (conversations[ci].id == convId) {
            updateStatusUI(parseInt(conversations[ci].is_online));
            updateBlockedNotice(conversations[ci].is_blocked == 1, name);
            break;
        }
    }

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
            if (res.messages.length) lastMsgId = parseInt(res.messages[res.messages.length - 1].id);
            pollInterval = setInterval(pollMessages, 5000);
            lucide.createIcons();
        })
        .catch(function() {
            chatMessages.innerHTML = '<p style="color:var(--text-muted);text-align:center;font-size:12px;">Error de conexión</p>';
        });
}

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
            lastMsgId = newestId;
            var wasAtBottom = chatMessages.scrollHeight - chatMessages.scrollTop - chatMessages.clientHeight < 60;
            renderMessages(msgs);
            if (wasAtBottom) scrollToBottom();
            loadConversations();
            var fd = new FormData();
            fd.append('conv_id', activeConvId);
            fetch('../messages/mark_read.php', { method: 'POST', body: fd });
        })
        .catch(function() {});
}

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
            for (var i = 0; i < conversations.length; i++) {
                if (conversations[i].id == activeConvId) {
                    conversations[i].last_msg = body || '📎 Adjunto';
                    conversations[i].last_time = res.message.created_at;
                    break;
                }
            }
            renderConvList(convSearch.value);
            loadConversations();
        });
}

function updateBlockedNotice(isBlocked, name) {
    var notice   = document.getElementById('blockedNotice');
    var inputBar = document.querySelector('.chat-input-bar');
    if (!notice) return;
    if (isBlocked) {
        var ini   = initials(name || '?');
        var color = avatarColor(name || '');
        notice.innerHTML =
            '<div class="blocked-avatar-wrap">'
          +   '<div class="blocked-avatar-initials" style="background:' + color + '">' + ini + '</div>'
          +   '<div class="blocked-avatar-badge"><i data-lucide="shield-off"></i></div>'
          + '</div>'
          + '<div class="blocked-info">'
          +   '<span class="blocked-title">Bloqueaste a <strong>' + escapeHtml(name || '') + '</strong></span>'
          +   '<span class="blocked-sub">No pueden enviarse mensajes</span>'
          + '</div>'
          + '<button id="btnUnblock" class="btn-unblock">'
          +   '<i data-lucide="shield-check"></i>Desbloquear'
          + '</button>';
        notice.style.display = 'flex';
        inputBar.style.display = 'none';
        lucide.createIcons({ nodes: [notice] });
        document.getElementById('btnUnblock').addEventListener('click', function() {
            blockUser(activeConvId, true);
        });
    } else {
        notice.style.display = 'none';
        inputBar.style.display = '';
    }
}

btnSend.addEventListener('click', sendMessage);
msgInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
});

chatHeader.addEventListener('click', function(e) {
    var btn = e.target.closest('.btn-chat-more');
    if (!btn) return;
    e.stopPropagation();
    openDropdown(btn, getHeaderMenuItems());
});

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

fetch('../messages/update_last_seen.php', { method: 'POST' });
setInterval(function() {
    fetch('../messages/update_last_seen.php', { method: 'POST' });
}, 30000);

setInterval(loadConversations, 10000);

renderConvList('');
lucide.createIcons();
