var conversations = convData || [];
var activeConvId  = null;
var activeFilter  = 'all';
var activeConvName = null;

var msgInput = document.getElementById('msgInput');
var btnSend  = document.getElementById('btnSend');

var currentMsgs = [];

var pendingAttUrl  = null;
var pendingAttType = null;
var pendingAttName = null;
var pendingAttSize = 0;

var pollInterval = null;
var typingPollInterval = null;
var statusPollInterval = null;
var infoMsgCurrent  = null;
var infoRelInterval = null;
var lastMsgId    = 0;
var replyToId = null, replyToBody = null, replyToSender = null;
var pinnedMsgId   = null;
var bookmarkedIds = [];
var selectMode = false;
var selectedMsgIds = [];
var typingThrottle = null;

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
    currentMsgs = msgs || [];
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

        var isPinned = pinnedMsgId && parseInt(m.id) === parseInt(pinnedMsgId);
        var cls = isMine ? 'msg-row mine' : 'msg-row theirs';
        if (isPinned) cls += ' is-pinned';
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
        if (parseInt(m.deleted_for_all)) {
            html += '<div class="msg-deleted">Mensaje eliminado</div>';
        } else {
            if (m.body) html += '<span class="msg-text">' + escapeHtml(m.body) + '</span>';
            if (m.attachment_url) {
                if (m.attachment_type === 'image') {
                    html += '<img class="msg-img" src="' + m.attachment_url + '" alt="imagen" loading="lazy" onerror="this.closest(\'.msg-bubble\').querySelector(\'.msg-img-error\') || this.insertAdjacentHTML(\'afterend\',\'<span class=\\\"msg-img-error\\\">Imagen no disponible</span>\'); this.remove();">';
                } else {
                    var fname = m.attachment_url.split('/').pop().replace(/^\d+_/, '');
                    html += '<div class="msg-attachment">';
                    html += '<span class="att-icon"><i data-lucide="file-text"></i></span>';
                    html += '<div class="att-info"><div class="att-name">' + escapeHtml(fname) + '</div>';
                    html += '<a class="att-size" href="' + m.attachment_url + '" target="_blank">Descargar</a>';
                    html += '</div></div>';
                }
            }
        }
        var isBookmarked = bookmarkedIds.indexOf(parseInt(m.id)) >= 0;
        html += '<div class="msg-footer">';
        if (isBookmarked) html += '<span class="msg-bookmarked-indicator" aria-label="Destacado"><i data-lucide="bookmark"></i></span>';
        html += '<span class="msg-time">' + formatMsgTime(m.created_at) + '</span>';
        if (isPinned) html += '<span class="msg-pin-indicator" aria-label="Fijado"><i data-lucide="pin"></i></span>';
        html += '</div>';
        html += '</div>';
        if (!isMine) html += '<button class="msg-actions-btn" aria-label="Opciones"><i data-lucide="chevron-down"></i></button>';
        html += '</div>';
    }

    chatMessages.innerHTML = html;
    lucide.createIcons({ nodes: [chatMessages] });
}

function openConversation(convId, name) {
    setTypingIndicator(false);
    typingThrottle = null;
    if (selectMode) exitSelectMode();
    if (pollInterval) { clearInterval(pollInterval); pollInterval = null; }
    if (typingPollInterval) { clearInterval(typingPollInterval); typingPollInterval = null; }
    if (statusPollInterval) { clearInterval(statusPollInterval); statusPollInterval = null; }
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
          '<div class="conv-avatar" style="background-color:' + color + ';width:36px;height:36px;font-size:12px;">' + ini + '</div>' +
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
            pinnedMsgId   = res.pinned_message_id || null;
            bookmarkedIds = res.bookmarked_ids ? res.bookmarked_ids.map(Number) : [];
            renderMessages(res.messages);
            updatePinnedBar(res.messages);
            scrollToBottom();
            updateStatusUI(res.is_online, res.last_seen);
            if (res.messages.length) lastMsgId = parseInt(res.messages[res.messages.length - 1].id);
            pollInterval = setInterval(pollMessages, 5000);
            if (typingPollInterval) clearInterval(typingPollInterval);
            typingPollInterval = setInterval(pollTyping, 500);
            if (statusPollInterval) clearInterval(statusPollInterval);
            statusPollInterval = setInterval(pollStatus, 8000);
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
            if (res.is_online !== undefined) updateStatusUI(res.is_online, res.last_seen);
            if (infoMsgCurrent && res.messages) {
                var _im = document.getElementById('infoModal');
                if (_im && _im.classList.contains('open')) {
                    for (var _k = 0; _k < res.messages.length; _k++) {
                        if (res.messages[_k].id == infoMsgCurrent.id) {
                            _refreshInfoStatus(parseInt(res.messages[_k].is_read) === 1);
                            break;
                        }
                    }
                }
            }
            if (!res.messages || !res.messages.length) {
                if (typeof res.other_typing !== 'undefined') setTypingIndicator(res.other_typing);
                return;
            }
            var msgs = res.messages;
            var newestId = parseInt(msgs[msgs.length - 1].id);
            if (newestId <= lastMsgId) {
                if (typeof res.other_typing !== 'undefined') setTypingIndicator(res.other_typing);
                return;
            }
            lastMsgId = newestId;
            var wasAtBottom = chatMessages.scrollHeight - chatMessages.scrollTop - chatMessages.clientHeight < 60;
            renderMessages(msgs);
            if (typeof res.other_typing !== 'undefined') setTypingIndicator(res.other_typing);
            if (wasAtBottom) scrollToBottom();
            loadConversations();
            var fd = new FormData();
            fd.append('conv_id', activeConvId);
            fetch('../messages/mark_read.php', { method: 'POST', body: fd });
        })
        .catch(function() {});
}

function pollTyping() {
    if (!activeConvId) return;
    fetch('../messages/poll_typing.php?conv_id=' + activeConvId)
        .then(function(r) { return r.json(); })
        .then(function(res) {
            if (res.ok) setTypingIndicator(res.other_typing);
        })
        .catch(function() {});
}

function pollStatus() {
    if (!activeConvId) return;
    fetch('../messages/poll_status.php?conv_id=' + activeConvId)
        .then(function(r) { return r.json(); })
        .then(function(res) {
            if (res.ok) updateStatusUI(res.is_online, res.last_seen);
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
    html += '<div class="msg-footer"><span class="msg-time">' + formatMsgTime(new Date().toISOString()) + '</span></div>';
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
        var color = avatarGradient(name || '');
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

var reportedItems = {};

var clearChatModal   = document.getElementById('clearChatModal');
var reportModal      = document.getElementById('reportModal');
var contactInfoModal = document.getElementById('contactInfoModal');

function closeModalAnimated(el) {
    var box = el.querySelector('.modal-box');
    if (!box) return;
    box.classList.add('closing');
    box.addEventListener('animationend', function h() {
        box.removeEventListener('animationend', h);
        box.classList.remove('closing');
        el.classList.remove('open');
    });
}

function clearChat() {
    if (!activeConvId) return;
    clearChatModal.classList.add('open');
    lucide.createIcons({ nodes: [clearChatModal] });
}

document.getElementById('btnCloseClearChat').addEventListener('click', function() { closeModalAnimated(clearChatModal); });
document.getElementById('btnCancelClear').addEventListener('click', function() { closeModalAnimated(clearChatModal); });
clearChatModal.addEventListener('click', function(e) { if (e.target === clearChatModal) closeModalAnimated(clearChatModal); });

document.getElementById('deleteMessageModal').addEventListener('click', function(e) {
    if (e.target === this) closeModalAnimated(this);
});

document.getElementById('btnConfirmClear').addEventListener('click', function() {
    closeModalAnimated(clearChatModal);
    var fd = new FormData();
    fd.append('conv_id', activeConvId);
    fetch('../messages/clear_chat.php', { method: 'POST', body: fd })
        .then(function(r) { return r.json(); })
        .then(function(res) {
            if (!res.ok) { message.error('Error al vaciar el chat'); return; }
            var rows = Array.from(chatMessages.querySelectorAll('.msg-row, .msg-date-sep'));
            var delay = rows.length > 20 ? 15 : 28;
            rows.reverse().forEach(function(el, idx) {
                setTimeout(function() {
                    el.style.transition = 'opacity 0.18s, transform 0.18s';
                    el.style.opacity = '0';
                    el.style.transform = 'translateY(-7px)';
                    setTimeout(function() { if (el.parentNode) el.remove(); }, 185);
                }, idx * delay);
            });
            var total = rows.length * delay + 220;
            setTimeout(function() {
                chatMessages.innerHTML = '<div class="msgs-empty"><i data-lucide="message-circle-dashed"></i><p>No hay mensajes aún</p></div>';
                lucide.createIcons({ nodes: [chatMessages] });
            }, total);
            lastMsgId = 0;
            for (var i = 0; i < conversations.length; i++) {
                if (conversations[i].id == activeConvId) {
                    conversations[i].last_msg = '';
                    conversations[i].last_time = null;
                    break;
                }
            }
            renderConvList(convSearch.value);
            message.success('Chat vaciado');
        })
        .catch(function() { message.error('Error de conexión'); });
});

var reportTargetType = null, reportTargetId = null;

function openReportModal(type, targetId) {
    reportTargetType = type;
    reportTargetId   = targetId;
    reportModal.querySelectorAll('input[name="report-reason"]').forEach(function(r) { r.checked = false; });
    document.getElementById('btnConfirmReport').disabled = true;
    reportModal.classList.add('open');
}

reportModal.querySelectorAll('input[name="report-reason"]').forEach(function(r) {
    r.addEventListener('change', function() {
        document.getElementById('btnConfirmReport').disabled = false;
    });
});

document.getElementById('btnCloseReport').addEventListener('click', function() { closeModalAnimated(reportModal); });
document.getElementById('btnCancelReport').addEventListener('click', function() { closeModalAnimated(reportModal); });
reportModal.addEventListener('click', function(e) { if (e.target === reportModal) closeModalAnimated(reportModal); });

document.getElementById('btnConfirmReport').addEventListener('click', function() {
    var reason = '';
    reportModal.querySelectorAll('input[name="report-reason"]').forEach(function(r) {
        if (r.checked) reason = r.value;
    });
    if (!reason) return;
    closeModalAnimated(reportModal);
    var fd = new FormData();
    fd.append('target_type', reportTargetType);
    fd.append('target_id', reportTargetId);
    fd.append('reason', reason);
    fetch('../messages/report.php', { method: 'POST', body: fd })
        .then(function(r) { return r.json(); })
        .then(function(res) {
            if (!res.ok) { message.error('Error al enviar reporte'); return; }
            reportedItems[reportTargetType + ':' + reportTargetId] = true;
            message.success('Reporte enviado. Gracias por avisar.');
        })
        .catch(function() { message.error('Error de conexión'); });
});

function openContactInfo() {
    if (!activeConvId) return;
    var conv = null;
    for (var i = 0; i < conversations.length; i++) {
        if (conversations[i].id == activeConvId) { conv = conversations[i]; break; }
    }
    if (!conv) return;
    var name      = activeConvName || 'Usuario';
    var color     = avatarColor(name);
    var ini       = initials(name);
    var isBlocked = conv.is_blocked == 1;
    var avatarEl  = document.getElementById('contactInfoAvatar');
    var nameEl    = document.getElementById('contactInfoName');
    var blockBtn  = document.getElementById('btnContactBlock');
    var blockLbl  = document.getElementById('btnContactBlockLabel');
    avatarEl.style.backgroundColor = color;
    avatarEl.textContent = ini;
    nameEl.textContent   = name;
    blockLbl.textContent = isBlocked ? 'Desbloquear usuario' : 'Bloquear usuario';
    blockBtn.className   = isBlocked ? 'btn-ci-block unblock' : 'btn-ci-block';
    blockBtn.onclick = function() {
        closeModalAnimated(contactInfoModal);
        blockUser(activeConvId, isBlocked);
    };
    _syncCiStatus(lastKnownStatus.isOnline, lastKnownStatus.lastSeen);
    contactInfoModal.classList.add('open');
    lucide.createIcons({ nodes: [contactInfoModal] });
}

document.getElementById('btnCloseContact').addEventListener('click', function() { closeModalAnimated(contactInfoModal); });
contactInfoModal.addEventListener('click', function(e) { if (e.target === contactInfoModal) closeModalAnimated(contactInfoModal); });

var deleteConvModal    = document.getElementById('deleteConvModal');
var pendingDeleteConvId = null;

function openDeleteConvModal(convId) {
    pendingDeleteConvId = convId;
    var name = '';
    for (var i = 0; i < conversations.length; i++) {
        if (conversations[i].id == convId) { name = conversations[i].other_name || ''; break; }
    }
    document.getElementById('deleteConvName').textContent = name;
    deleteConvModal.classList.add('open');
    lucide.createIcons({ nodes: [deleteConvModal] });
}

document.getElementById('btnCloseDeleteConv').addEventListener('click', function() { closeModalAnimated(deleteConvModal); });
document.getElementById('btnCancelDeleteConv').addEventListener('click', function() { closeModalAnimated(deleteConvModal); });
deleteConvModal.addEventListener('click', function(e) { if (e.target === deleteConvModal) closeModalAnimated(deleteConvModal); });

document.getElementById('btnConfirmDeleteConv').addEventListener('click', function() {
    var convId = pendingDeleteConvId;
    if (!convId) return;
    pendingDeleteConvId = null;
    closeModalAnimated(deleteConvModal);
    var fd = new FormData();
    fd.append('conv_id', convId);
    fetch('../messages/delete_conversation.php', { method: 'POST', body: fd })
        .then(function(r) { return r.json(); })
        .then(function(res) {
            if (!res.ok) { message.error('No se pudo eliminar'); return; }
            conversations = conversations.filter(function(c) { return c.id != convId; });
            var item = convList.querySelector('[data-id="' + convId + '"]');
            if (item) {
                item.style.transition = 'opacity 0.2s, max-height 0.25s, padding 0.25s';
                item.style.overflow = 'hidden';
                item.style.maxHeight = item.offsetHeight + 'px';
                item.style.opacity = '0';
                setTimeout(function() {
                    item.style.maxHeight = '0';
                    item.style.padding = '0';
                    setTimeout(function() { if (item.parentNode) item.remove(); }, 260);
                }, 50);
            }
            if (convId == activeConvId) closeChatPanel();
            message.success('Conversación eliminada');
        })
        .catch(function() { message.error('Error de conexión'); });
});

btnSend.addEventListener('click', sendMessage);
msgInput.addEventListener('keydown', function(e) {
    if (!activeConvId || typingThrottle) {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
        return;
    }
    fetch('../messages/typing.php', {
        method: 'POST',
        body: new URLSearchParams({ conv_id: activeConvId })
    });
    typingThrottle = setTimeout(function() { typingThrottle = null; }, 1000);
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
    var msgObj = currentMsgs.find(function(m) { return parseInt(m.id) === msgId; }) || null;
    openDropdown(bubble, getMsgMenuItems(isMine, text, msgId, senderName, msgObj));
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
    if (selectMode) {
        var row = e.target.closest('.msg-row');
        if (row) {
            var sid = parseInt(row.dataset.msgId);
            if (sid) toggleMsgSelection(sid);
        }
        return;
    }
    var btn = e.target.closest('.msg-actions-btn');
    if (btn) {
        e.stopPropagation();
        var row = btn.closest('.msg-row');
        var bubble = row.querySelector('.msg-bubble');
        var isMine = row.classList.contains('mine');
        var text = getBubbleText(bubble);
        var msgId = parseInt(row.getAttribute('data-msg-id')) || 0;
        var senderName = isMine ? 'Tú' : (activeConvName || 'Ellos');
        var msgObj = currentMsgs.find(function(m) { return parseInt(m.id) === msgId; }) || null;
        openDropdown(btn, getMsgMenuItems(isMine, text, msgId, senderName, msgObj));
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
    if (selectMode) { exitSelectMode(); return; }
    var delMsgModal = document.getElementById('deleteMessageModal');
    if (delMsgModal && delMsgModal.classList.contains('open')) { closeModalAnimated(delMsgModal); return; }
    if (document.getElementById('forwardSheet').classList.contains('open')) {
        closeForwardModal(); return;
    }
    if (document.getElementById('bookmarksDrawer').classList.contains('open')) {
        closeBookmarksDrawer(); return;
    }
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
    if (clearChatModal.classList.contains('open'))    { closeModalAnimated(clearChatModal);    return; }
    if (reportModal.classList.contains('open'))        { closeModalAnimated(reportModal);        return; }
    if (contactInfoModal.classList.contains('open'))   { closeModalAnimated(contactInfoModal);   return; }
    if (deleteConvModal.classList.contains('open'))    { closeModalAnimated(deleteConvModal);    return; }
    if (document.getElementById('infoModal').classList.contains('open')) { closeInfoModal(); return; }
    if (attachPopup.classList.contains('show'))       { closeAttachPopup();                    return; }
    if (replyBar.style.display !== 'none')            { cancelReply();                         return; }
    if (msgDropdown.classList.contains('show'))        { closeDropdown();                       return; }
    if (newConvBackdrop.classList.contains('open'))   { closeModal();                          return; }
    if (activeConvId && window.innerWidth <= 480)     { closeMobileChat();                     return; }
    if (activeConvId)                                  { closeChatPanel(); }
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

function flashMessage(msgId) {
    var row = chatMessages.querySelector('[data-msg-id="' + msgId + '"]');
    if (!row) return;
    row.scrollIntoView({ behavior: 'smooth', block: 'center' });
    var bub = row.querySelector('.msg-bubble');
    if (!bub) return;
    bub.classList.remove('msg-highlight-flash');
    void bub.offsetWidth;
    bub.classList.add('msg-highlight-flash');
    bub.addEventListener('animationend', function h() {
        bub.removeEventListener('animationend', h);
        bub.classList.remove('msg-highlight-flash');
    });
}

function updatePinnedBar(msgs) {
    var bar = document.getElementById('pinnedBar');
    if (!pinnedMsgId) { hidePinnedBar(); return; }
    var msg = null;
    for (var i = 0; i < msgs.length; i++) {
        if (parseInt(msgs[i].id) === parseInt(pinnedMsgId)) { msg = msgs[i]; break; }
    }
    if (!msg) { hidePinnedBar(); return; }
    var isMine = parseInt(msg.sender_id) === currentUid;
    document.getElementById('pinnedBarSender').textContent = (isMine ? 'Tú' : (activeConvName || 'Ellos')) + ': ';
    document.getElementById('pinnedBarBody').textContent   = msg.body || (msg.attachment_type === 'image' ? '📷 Imagen' : '📎 Archivo');
    bar.classList.remove('hiding');
    if (!bar.classList.contains('show')) {
        bar.classList.add('show');
        lucide.createIcons({ nodes: [bar] });
    }
}

function hidePinnedBar() {
    var bar = document.getElementById('pinnedBar');
    if (!bar.classList.contains('show')) return;
    bar.classList.add('hiding');
    bar.addEventListener('animationend', function h() {
        bar.removeEventListener('animationend', h);
        bar.classList.remove('show', 'hiding');
    });
}

function pinMessage(msgId) {
    var fd = new FormData();
    fd.append('conv_id', activeConvId);
    fd.append('msg_id', msgId);
    fd.append('action', 'pin');
    fetch('../messages/pin_message.php', { method: 'POST', body: fd })
        .then(function(r) { return r.json(); })
        .then(function(res) {
            if (!res.ok) { message.error('Error al fijar'); return; }
            var old = pinnedMsgId;
            pinnedMsgId = msgId;
            if (old) {
                var oldRow = chatMessages.querySelector('[data-msg-id="' + old + '"]');
                if (oldRow) {
                    oldRow.classList.remove('is-pinned');
                    var oldInd = oldRow.querySelector('.msg-pin-indicator');
                    if (oldInd) oldInd.remove();
                }
            }
            var newRow = chatMessages.querySelector('[data-msg-id="' + msgId + '"]');
            if (newRow) {
                newRow.classList.add('is-pinned');
                var footer = newRow.querySelector('.msg-footer');
                if (footer && !footer.querySelector('.msg-pin-indicator')) {
                    var ind = document.createElement('span');
                    ind.className = 'msg-pin-indicator';
                    ind.setAttribute('aria-label', 'Fijado');
                    ind.innerHTML = '<i data-lucide="pin"></i>';
                    footer.appendChild(ind);
                    lucide.createIcons({ nodes: [ind] });
                }
            }
            var bar     = document.getElementById('pinnedBar');
            var bubble  = newRow ? newRow.querySelector('.msg-bubble') : null;
            var isMine  = newRow ? newRow.classList.contains('mine') : false;
            document.getElementById('pinnedBarSender').textContent = (isMine ? 'Tú' : (activeConvName || 'Ellos')) + ': ';
            document.getElementById('pinnedBarBody').textContent   = bubble ? getBubbleText(bubble) : '';
            bar.classList.remove('hiding');
            if (!bar.classList.contains('show')) {
                bar.classList.add('show');
                lucide.createIcons({ nodes: [bar] });
            }
            message.success('Mensaje fijado');
        })
        .catch(function() { message.error('Error de conexión'); });
}

function unpinMessage() {
    var fd = new FormData();
    fd.append('conv_id', activeConvId);
    fd.append('action', 'unpin');
    fetch('../messages/pin_message.php', { method: 'POST', body: fd })
        .then(function(r) { return r.json(); })
        .then(function(res) {
            if (!res.ok) { message.error('Error al desfijar'); return; }
            var old = pinnedMsgId;
            pinnedMsgId = null;
            if (old) {
                var oldRow = chatMessages.querySelector('[data-msg-id="' + old + '"]');
                if (oldRow) {
                    oldRow.classList.remove('is-pinned');
                    var ind = oldRow.querySelector('.msg-pin-indicator');
                    if (ind) ind.remove();
                }
            }
            hidePinnedBar();
            message.success('Mensaje desfijado');
        })
        .catch(function() { message.error('Error de conexión'); });
}

function toggleBookmark(msgId) {
    var fd = new FormData();
    fd.append('msg_id', msgId);
    fetch('../messages/bookmark_message.php', { method: 'POST', body: fd })
        .then(function(r) { return r.json(); })
        .then(function(res) {
            if (!res.ok) { message.error('Error al destacar'); return; }
            var row    = chatMessages.querySelector('[data-msg-id="' + msgId + '"]');
            var footer = row ? row.querySelector('.msg-footer') : null;
            if (res.bookmarked) {
                if (bookmarkedIds.indexOf(msgId) < 0) bookmarkedIds.push(msgId);
                if (footer && !footer.querySelector('.msg-bookmarked-indicator')) {
                    var ind = document.createElement('span');
                    ind.className = 'msg-bookmarked-indicator';
                    ind.setAttribute('aria-label', 'Destacado');
                    ind.innerHTML = '<i data-lucide="bookmark"></i>';
                    footer.insertBefore(ind, footer.firstChild);
                    lucide.createIcons({ nodes: [ind] });
                }
                message.success('Guardado en destacados');
            } else {
                bookmarkedIds = bookmarkedIds.filter(function(id) { return id != msgId; });
                if (footer) {
                    var indEl = footer.querySelector('.msg-bookmarked-indicator');
                    if (indEl) {
                        indEl.classList.add('bm-ind-out');
                        indEl.addEventListener('animationend', function() { indEl.remove(); }, { once: true });
                    }
                }
                message.success('Eliminado de destacados');
            }
        })
        .catch(function() { message.error('Error de conexión'); });
}

function openBookmarksDrawer() {
    var drawer  = document.getElementById('bookmarksDrawer');
    var backdrop = document.getElementById('bookmarksBackdrop');
    var bmList  = document.getElementById('bmList');
    bmList.innerHTML = '<div class="bm-loading"><span></span><span></span><span></span></div>';
    backdrop.classList.add('open');
    drawer.classList.add('open');
    fetch('../messages/get_bookmarks.php')
        .then(function(r) { return r.json(); })
        .then(function(res) {
            if (!res.ok) { bmList.innerHTML = '<div class="bm-empty"><p>Error al cargar</p></div>'; return; }
            renderBookmarkItems(res.bookmarks);
        })
        .catch(function() { bmList.innerHTML = '<div class="bm-empty"><p>Error de conexión</p></div>'; });
}

function closeBookmarksDrawer() {
    document.getElementById('bookmarksDrawer').classList.remove('open');
    document.getElementById('bookmarksBackdrop').classList.remove('open');
}

function renderBookmarkItems(bookmarks) {
    var bmList = document.getElementById('bmList');
    if (!bookmarks || !bookmarks.length) {
        bmList.innerHTML = '<div class="bm-empty"><i data-lucide="bookmark"></i><p>Aún no tienes mensajes destacados</p></div>';
        lucide.createIcons({ nodes: [bmList] });
        return;
    }
    var html = '';
    for (var i = 0; i < bookmarks.length; i++) {
        var bm    = bookmarks[i];
        var color = avatarColor(bm.sender_name || '');
        var ini   = initials(bm.sender_name || '?');
        var preview = bm.body || (bm.attachment_type === 'image' ? '📷 Imagen' : '📎 Archivo');
        var dateStr = formatTime(bm.bm_date);
        html += '<div class="bm-item bm-item-in" data-msg-id="' + bm.message_id + '" data-conv-id="' + bm.conversation_id + '" style="animation-delay:' + (i * 45) + 'ms">';
        html += '<div class="bm-item-header">';
        html += '<div class="bm-avatar" style="background-color:' + color + '">' + escapeHtml(ini) + '</div>'
        html += '<span class="bm-sender">' + escapeHtml(bm.sender_name || 'Usuario') + '</span>';
        html += '<span class="bm-date">' + escapeHtml(dateStr) + '</span>';
        html += '<button class="bm-remove-btn" aria-label="Quitar destacado"><i data-lucide="x"></i></button>';
        html += '</div>';
        html += '<div class="bm-preview">' + escapeHtml(preview) + '</div>';
        html += '<button class="bm-goto-btn">Ir al mensaje <i data-lucide="arrow-right"></i></button>';
        html += '</div>';
    }
    bmList.innerHTML = html;
    lucide.createIcons({ nodes: [bmList] });

    bmList.querySelectorAll('.bm-remove-btn').forEach(function(removeBtn) {
        removeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            var item  = removeBtn.closest('.bm-item');
            var rmId  = parseInt(item.getAttribute('data-msg-id'));
            var curH  = item.offsetHeight;
            item.style.maxHeight = curH + 'px';
            void item.offsetWidth;
            item.classList.add('bm-removing');
            item.addEventListener('transitionend', function done() {
                item.removeEventListener('transitionend', done);
                item.remove();
                bookmarkedIds = bookmarkedIds.filter(function(id) { return id != rmId; });
                var chatRow = chatMessages.querySelector('[data-msg-id="' + rmId + '"]');
                if (chatRow) {
                    var chatInd = chatRow.querySelector('.msg-bookmarked-indicator');
                    if (chatInd) chatInd.remove();
                }
                var rmFd = new FormData(); rmFd.append('msg_id', rmId);
                fetch('../messages/bookmark_message.php', { method: 'POST', body: rmFd });
                if (!bmList.querySelector('.bm-item')) {
                    bmList.innerHTML = '<div class="bm-empty"><i data-lucide="bookmark"></i><p>Aún no tienes mensajes destacados</p></div>';
                    lucide.createIcons({ nodes: [bmList] });
                }
            });
        });
    });

    bmList.querySelectorAll('.bm-goto-btn').forEach(function(gotoBtn) {
        gotoBtn.addEventListener('click', function() {
            var item   = gotoBtn.closest('.bm-item');
            var gMsgId = parseInt(item.getAttribute('data-msg-id'));
            var gConvId = parseInt(item.getAttribute('data-conv-id'));
            closeBookmarksDrawer();
            if (gConvId === activeConvId) {
                setTimeout(function() { flashMessage(gMsgId); }, 60);
            } else {
                var convEl = convList.querySelector('[data-id="' + gConvId + '"]');
                if (convEl) {
                    convEl.click();
                    setTimeout(function() { flashMessage(gMsgId); }, 700);
                }
            }
        });
    });
}

function enterSelectMode(initialMsgId) {
    selectMode = true;
    selectedMsgIds = [];
    var chatEl = document.querySelector('.chat-messages');
    chatEl.classList.add('select-mode');

    var rows = chatEl.querySelectorAll('.msg-row');
    rows.forEach(function(row, i) {
        row.style.setProperty('--check-delay', Math.min(i, 8) * 18 + 'ms');
    });

    var bar = document.getElementById('selectActionBar');
    bar.classList.remove('hiding');
    bar.classList.add('visible');

    if (initialMsgId) toggleMsgSelection(initialMsgId);
    closeDropdown();
}

function exitSelectMode() {
    selectMode = false;
    selectedMsgIds = [];
    var chatEl = document.querySelector('.chat-messages');
    chatEl.classList.add('select-mode-out');

    var bar = document.getElementById('selectActionBar');
    bar.classList.add('hiding');

    bar.addEventListener('animationend', function handler() {
        bar.classList.remove('visible', 'hiding');
        bar.removeEventListener('animationend', handler);
    });

    setTimeout(function() {
        chatEl.classList.remove('select-mode', 'select-mode-out');
        chatEl.querySelectorAll('.msg-row').forEach(function(r) {
            r.classList.remove('selected');
            r.style.removeProperty('--check-delay');
            var icon = r.querySelector('.msg-check-icon');
            if (icon) icon.remove();
        });
    }, 160);
}

function toggleMsgSelection(msgId) {
    var row = document.querySelector('.msg-row[data-msg-id="' + msgId + '"]');
    if (!row) return;
    var idx = selectedMsgIds.indexOf(msgId);
    if (idx >= 0) {
        selectedMsgIds.splice(idx, 1);
        row.classList.remove('selected');
        var icon = row.querySelector('.msg-check-icon');
        if (icon) icon.remove();
    } else {
        selectedMsgIds.push(msgId);
        row.classList.add('selected');
        var icon = document.createElement('i');
        icon.setAttribute('data-lucide', 'check');
        icon.className = 'msg-check-icon';
        row.appendChild(icon);
        lucide.createIcons({ nodes: [row] });
        row.classList.remove('select-bounce');
        void row.offsetWidth;
        row.classList.add('select-bounce');
        setTimeout(function() { row.classList.remove('select-bounce'); }, 200);
    }
    updateSelectBar();
}

function updateSelectBar() {
    var n = selectedMsgIds.length;
    document.getElementById('selectCount').textContent = n + ' seleccionado' + (n !== 1 ? 's' : '');
    document.getElementById('btnDeleteSelected').disabled = n === 0;
    document.getElementById('btnForwardSelected').disabled = n === 0;
}

function deleteMessagePrompt(msgIds) {
    var ids = msgIds || selectedMsgIds.slice();
    if (!ids.length) return;
    var allMine = ids.every(function(id) {
        var row = document.querySelector('.msg-row[data-msg-id="' + id + '"]');
        return row && row.classList.contains('mine');
    });
    document.getElementById('btnDelForAll').style.display = allMine ? '' : 'none';
    document.getElementById('delModalDesc').textContent =
        ids.length === 1 ? '¿Cómo quieres eliminar este mensaje?' : '¿Cómo quieres eliminar los ' + ids.length + ' mensajes?';
    var modal = document.getElementById('deleteMessageModal');
    modal.classList.add('open');
    lucide.createIcons({ nodes: [modal] });
    document.getElementById('btnDelForMe').onclick = function() {
        closeModalAnimated(modal);
        deleteMessages(ids, 'me');
    };
    document.getElementById('btnDelForAll').onclick = function() {
        closeModalAnimated(modal);
        deleteMessages(ids, 'all');
    };
    document.getElementById('btnCancelDel').onclick = function() { closeModalAnimated(modal); };
    document.getElementById('btnCloseDel').onclick  = function() { closeModalAnimated(modal); };
}

function deleteMessages(ids, scope) {
    Promise.all(ids.map(function(msgId) {
        var fd = new FormData();
        fd.append('msg_id', msgId);
        fd.append('scope', scope);
        return fetch('../messages/delete_message.php', { method: 'POST', body: fd }).then(function(r) { return r.json(); });
    })).then(function() {
        ids.forEach(function(msgId) {
            var row = document.querySelector('.msg-row[data-msg-id="' + msgId + '"]');
            if (!row) return;
            if (scope === 'me' || scope === 'all') {
                row.style.height = row.offsetHeight + 'px';
                row.style.overflow = 'hidden';
                row.style.transition = 'height 0.25s ease, opacity 0.2s, margin-bottom 0.25s';
                requestAnimationFrame(function() {
                    row.style.height = '0';
                    row.style.opacity = '0';
                    row.style.marginBottom = '0';
                });
                setTimeout(function() { if (row.parentNode) row.remove(); }, 270);
            }
        });
        if (selectMode) exitSelectMode();
        message.success('Mensaje eliminado');
    }).catch(function() { message.error('Error al eliminar'); });
}

document.getElementById('btnExitSelect').addEventListener('click', exitSelectMode);
document.getElementById('btnDeleteSelected').addEventListener('click', function() {
    deleteMessagePrompt(selectedMsgIds.slice());
});
document.getElementById('btnForwardSelected').addEventListener('click', function() {
    if (!selectedMsgIds.length) return;
    var ids = selectedMsgIds.slice();
    exitSelectMode();
    openForwardModal(ids, ids.length + ' mensajes seleccionados');
});

document.getElementById('btnUnpin').addEventListener('click', function(e) {
    e.stopPropagation();
    unpinMessage();
});
document.getElementById('pinnedBar').addEventListener('click', function(e) {
    if (e.target.closest('#btnUnpin')) return;
    if (pinnedMsgId) flashMessage(pinnedMsgId);
});
document.getElementById('btnCloseBookmarks').addEventListener('click', closeBookmarksDrawer);
document.getElementById('bookmarksBackdrop').addEventListener('click', closeBookmarksDrawer);

document.getElementById('btnCloseForward').addEventListener('click', closeForwardModal);
document.getElementById('btnCancelForward').addEventListener('click', closeForwardModal);
document.getElementById('btnConfirmForward').addEventListener('click', confirmForward);
document.getElementById('forwardBackdrop').addEventListener('click', closeForwardModal);
document.getElementById('forwardSearch').addEventListener('input', function() {
    document.getElementById('fwSearchClear').classList.toggle('visible', this.value.length > 0);
    renderForwardConvList(conversations);
});
document.getElementById('fwSearchClear').addEventListener('click', function() {
    document.getElementById('forwardSearch').value = '';
    this.classList.remove('visible');
    renderForwardConvList(conversations);
    document.getElementById('forwardSearch').focus();
});

fetch('../messages/update_last_seen.php', { method: 'POST' });
setInterval(function() {
    fetch('../messages/update_last_seen.php', { method: 'POST' });
}, 30000);

setInterval(loadConversations, 10000);

function openInfoModal(msg) {
    infoMsgCurrent = msg;
    if (infoRelInterval) { clearInterval(infoRelInterval); infoRelInterval = null; }
    var date = new Date(msg.created_at);
    var formatted = date.toLocaleDateString('es-MX', {
        day: 'numeric', month: 'long', year: 'numeric'
    }) + ', ' + date.toLocaleTimeString('es-MX', {
        hour: '2-digit', minute: '2-digit'
    });
    var timeShort = date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    var diff = Math.floor((Date.now() - date.getTime()) / 60000);
    var relative = diff < 1    ? 'ahora mismo'
                 : diff < 60   ? 'hace ' + diff + ' min'
                 : diff < 1440 ? 'hace ' + Math.floor(diff / 60) + ' h'
                 :               'hace ' + Math.floor(diff / 1440) + ' días';
    var isRead = parseInt(msg.is_read) === 1;

    var preview = '';
    if (msg.body) {
        preview = msg.body.substring(0, 140) + (msg.body.length > 140 ? '…' : '');
    } else if (msg.attachment_type === 'image')    { preview = 'Imagen adjunta'; }
    else if (msg.attachment_type === 'file')        { preview = 'Archivo adjunto'; }
    else if (msg.attachment_type === 'location')    { preview = 'Ubicación compartida'; }
    else if (msg.attachment_type === 'audio')       { preview = 'Mensaje de audio'; }
    else if (msg.attachment_type === 'contact')     { preview = 'Contacto compartido'; }

    var typeMap = {
        'image':    { icon: 'image',     label: 'Imagen' },
        'file':     { icon: 'paperclip', label: 'Archivo' },
        'audio':    { icon: 'music',     label: 'Audio' },
        'location': { icon: 'map-pin',   label: 'Ubicación' },
        'contact':  { icon: 'user',      label: 'Contacto' }
    };
    var typeInfo = (msg.attachment_type && typeMap[msg.attachment_type])
        ? typeMap[msg.attachment_type]
        : { icon: 'message-square', label: 'Texto' };

    document.getElementById('infoMsgPreview').textContent = preview;
    var msgTimeEl = document.getElementById('infoMsgTime');
    if (msgTimeEl) msgTimeEl.textContent = timeShort;
    document.getElementById('infoDate').textContent = formatted;
    document.getElementById('infoRelative').textContent = relative;

    var statusIconWrap = document.getElementById('infoStatusIconWrap');
    var statusText     = document.getElementById('infoStatusText');
    var statusRow      = document.getElementById('infoRowStatus');
    if (isRead) {
        statusIconWrap.classList.add('read');
        statusText.textContent = 'Leído';
        statusText.classList.add('read');
        if (statusRow) statusRow.classList.add('read-row');
    } else {
        statusIconWrap.classList.remove('read');
        statusText.textContent = 'Enviado';
        statusText.classList.remove('read');
        if (statusRow) statusRow.classList.remove('read-row');
    }

    var typeIconWrap = document.getElementById('infoTypeIconWrap');
    var typeIcon     = document.getElementById('infoTypeIcon');
    var typeText     = document.getElementById('infoTypeText');
    typeIcon.setAttribute('data-lucide', typeInfo.icon);
    typeText.textContent = typeInfo.label;
    typeIconWrap.className = 'info-row-icon-wrap';

    infoRelInterval = setInterval(_refreshInfoRelative, 30000);
    var modal = document.getElementById('infoModal');
    modal.classList.add('open');
    lucide.createIcons({ nodes: [modal] });
}

function _refreshInfoRelative() {
    if (!infoMsgCurrent) return;
    var d = new Date(infoMsgCurrent.created_at);
    var diff = Math.floor((Date.now() - d.getTime()) / 60000);
    var txt = diff < 1    ? 'ahora mismo'
            : diff < 60   ? 'hace ' + diff + ' min'
            : diff < 1440 ? 'hace ' + Math.floor(diff / 60) + ' h'
            :               'hace ' + Math.floor(diff / 1440) + ' días';
    var el = document.getElementById('infoRelative');
    if (!el || el.textContent === txt) return;
    el.classList.add('refreshing');
    setTimeout(function() { el.textContent = txt; el.classList.remove('refreshing'); }, 180);
}

function _refreshInfoStatus(isRead) {
    if (!infoMsgCurrent) return;
    if ((parseInt(infoMsgCurrent.is_read) === 1) === !!isRead) return;
    infoMsgCurrent.is_read = isRead ? 1 : 0;
    var iconWrap   = document.getElementById('infoStatusIconWrap');
    var statusText = document.getElementById('infoStatusText');
    if (!iconWrap || !statusText) return;
    var statusRow = document.getElementById('infoRowStatus');
    if (isRead) {
        iconWrap.classList.add('read', 'info-status-flash');
        statusText.classList.add('read');
        statusText.textContent = 'Leído';
        if (statusRow) statusRow.classList.add('read-row');
    } else {
        iconWrap.classList.remove('read');
        iconWrap.classList.add('info-status-flash');
        statusText.classList.remove('read');
        statusText.textContent = 'Enviado';
        if (statusRow) statusRow.classList.remove('read-row');
    }
    setTimeout(function() { iconWrap.classList.remove('info-status-flash'); }, 500);
}

function closeInfoModal() {
    if (infoRelInterval) { clearInterval(infoRelInterval); infoRelInterval = null; }
    infoMsgCurrent = null;
    closeModalAnimated(document.getElementById('infoModal'));
}
document.getElementById('btnCloseInfo').addEventListener('click', closeInfoModal);
document.getElementById('btnCloseInfo2').addEventListener('click', closeInfoModal);
document.getElementById('infoModal').addEventListener('click', function(e) {
    if (e.target === this) closeInfoModal();
});

function setTypingIndicator(active) {
    var existing = chatMessages.querySelector('.typing-indicator-row');
    if (active) {
        if (!existing) {
            var el = document.createElement('div');
            el.className = 'typing-indicator-row';
            el.innerHTML = '<div class="typing-bubble"><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></div>';
            chatMessages.appendChild(el);
            scrollToBottom();
        }
    } else {
        if (existing) existing.remove();
    }
    var statusEl = chatHeader.querySelector('.chat-status');
    if (!statusEl) return;
    if (active) {
        if (!statusEl.classList.contains('typing')) {
            statusEl.dataset.prev = statusEl.textContent;
            statusEl.classList.add('typing');
            statusEl.innerHTML = '<span class="header-typing-dots"><span></span><span></span><span></span></span>Escribiendo...';
        }
    } else {
        if (statusEl.classList.contains('typing')) {
            statusEl.classList.remove('typing');
            statusEl.textContent = statusEl.dataset.prev || 'Desconectado';
            delete statusEl.dataset.prev;
        }
    }
}

renderConvList('');
lucide.createIcons();
