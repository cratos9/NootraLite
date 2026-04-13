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

var btnNewConv    = document.getElementById('btnNewConv');
var newConvBackdrop = document.getElementById('newConvBackdrop');
var btnCloseModal = document.getElementById('btnCloseModal');
var userSearch    = document.getElementById('userSearch');
var userResults   = document.getElementById('userResults');

var pollInterval = null;
var lastMsgId = 0;

// --- utilidades ---

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

// --- render lista conversaciones ---

function renderConvList(filter) {
    filter = (filter || '').toLowerCase();
    var filtered = conversations.filter(function(c) {
        return !filter || (c.other_name && c.other_name.toLowerCase().indexOf(filter) >= 0);
    });

    if (filtered.length === 0) {
        convList.innerHTML = '<div class="conv-empty">Sin conversaciones</div>';
        return;
    }

    var html = '';
    for (var i = 0; i < filtered.length; i++) {
        var c = filtered[i];
        var name = c.other_name || 'Usuario';
        var color = avatarColor(name);
        var ini = initials(name);
        var unread = parseInt(c.unread) || 0;
        var lastMsg = c.last_msg ? c.last_msg.slice(0, 36) + (c.last_msg.length > 36 ? '…' : '') : 'Sin mensajes';
        var time = formatTime(c.last_time);
        var isActive = c.id == activeConvId ? ' active' : '';

        html += '<div class="conv-item' + isActive + '" data-id="' + c.id + '" data-name="' + encodeURIComponent(name) + '">';
        html += '<div class="conv-avatar" style="background:' + color + '">' + ini + '</div>';
        html += '<div class="conv-info">';
        html += '<div class="conv-name">' + name + '</div>';
        html += '<div class="conv-last">' + lastMsg + '</div>';
        html += '</div>';
        html += '<div class="conv-meta">';
        if (time) html += '<span class="conv-time">' + time + '</span>';
        if (unread > 0) html += '<span class="conv-badge">' + unread + '</span>';
        html += '</div>';
        html += '</div>';
    }
    convList.innerHTML = html;

    convList.querySelectorAll('.conv-item').forEach(function(el) {
        el.addEventListener('click', function() {
            openConversation(parseInt(el.getAttribute('data-id')), decodeURIComponent(el.getAttribute('data-name')));
        });
    });
}

// --- abrir conversacion ---

function openConversation(convId, name) {
    // limpiar polling anterior
    if (pollInterval) { clearInterval(pollInterval); pollInterval = null; }
    lastMsgId = 0;
    activeConvId = convId;

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
          '<span class="chat-status">En línea</span>' +
        '</div>' +
        '<div class="chat-header-actions">' +
          '<button class="btn-chat-action" aria-label="Llamar"><i data-lucide="phone"></i></button>' +
          '<button class="btn-chat-action" aria-label="Video"><i data-lucide="video"></i></button>' +
        '</div>';

    // mobile: esconder lista, mostrar chat
    if (window.innerWidth <= 480) {
        document.querySelector('.conv-panel').classList.add('hidden');
        document.querySelector('.chat-panel').classList.add('mobile-active');
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
    chatMessages.innerHTML = '<div class="msgs-loading"><span></span><span></span><span></span></div>';

    fetch('../messages/get_messages.php?conv_id=' + convId)
        .then(function(r) { return r.json(); })
        .then(function(res) {
            if (!res.ok) { chatMessages.innerHTML = '<p style="color:var(--text-muted);text-align:center;font-size:12px;">Error al cargar</p>'; return; }
            renderMessages(res.messages);
            scrollToBottom();
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
    document.querySelector('.conv-panel').classList.remove('hidden');
    document.querySelector('.chat-panel').classList.remove('mobile-active');
    chatActive.style.display = 'none';
    chatEmpty.style.display = '';
    activeConvId = null;
    lastMsgId = 0;
    var btn = document.getElementById('btnBack');
    if (btn) btn.remove();
}

// polling para mensajes nuevos en el chat activo
function pollMessages() {
    if (!activeConvId) return;
    fetch('../messages/get_messages.php?conv_id=' + activeConvId)
        .then(function(r) { return r.json(); })
        .then(function(res) {
            if (!res.ok || !res.messages || !res.messages.length) return;
            var msgs = res.messages;
            var newestId = parseInt(msgs[msgs.length - 1].id);
            if (newestId <= lastMsgId) return;
            // hay mensajes nuevos
            lastMsgId = newestId;
            var wasAtBottom = chatMessages.scrollHeight - chatMessages.scrollTop - chatMessages.clientHeight < 60;
            renderMessages(msgs);
            if (wasAtBottom) scrollToBottom();
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
        html += '<div class="' + cls + '">';
        html += '<div class="msg-bubble">';
        if (m.body) html += '<span class="msg-text">' + escapeHtml(m.body) + '</span>';
        html += '<span class="msg-time">' + formatMsgTime(m.created_at) + '</span>';
        html += '</div>';
        html += '</div>';
    }

    chatMessages.innerHTML = html;
}

function escapeHtml(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// --- enviar mensaje ---

function sendMessage() {
    var body = msgInput.value.trim();
    if (!body || !activeConvId) return;

    msgInput.value = '';
    msgInput.focus();

    // render optimista
    var html = '<div class="msg-row mine">';
    html += '<div class="msg-bubble">';
    html += '<span class="msg-text">' + escapeHtml(body) + '</span>';
    html += '<span class="msg-time">' + formatMsgTime(new Date().toISOString()) + '</span>';
    html += '</div></div>';
    chatMessages.insertAdjacentHTML('beforeend', html);
    scrollToBottom();

    var fd = new FormData();
    fd.append('conv_id', activeConvId);
    fd.append('body', body);

    fetch('../messages/send_message.php', { method: 'POST', body: fd })
        .then(function(r) { return r.json(); })
        .then(function(res) {
            if (!res.ok) return;
            // actualizar last_msg en data local
            for (var i = 0; i < conversations.length; i++) {
                if (conversations[i].id == activeConvId) {
                    conversations[i].last_msg = body;
                    conversations[i].last_time = res.message.created_at;
                }
            }
            renderConvList(convSearch.value);
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

// --- adjuntar archivo ---

document.getElementById('btnAttach').addEventListener('click', function() {
    document.getElementById('fileInput').click();
});

// --- modal nueva conversacion ---

btnNewConv.addEventListener('click', function() {
    newConvBackdrop.classList.add('open');
    userSearch.value = '';
    userResults.innerHTML = '';
    setTimeout(function() { userSearch.focus(); }, 50);
});

btnCloseModal.addEventListener('click', closeModal);
newConvBackdrop.addEventListener('click', function(e) {
    if (e.target === newConvBackdrop) closeModal();
});

function closeModal() {
    newConvBackdrop.classList.remove('open');
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
                    html += '<div class="user-result-item" data-uid="' + u.id + '">' + u.name + '</div>';
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

// --- init ---

renderConvList('');
lucide.createIcons();
