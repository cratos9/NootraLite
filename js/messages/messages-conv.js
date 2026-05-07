var convList        = document.getElementById('convList');
var convSearch      = document.getElementById('convSearch');
var btnNewConv      = document.getElementById('btnNewConv');
var newConvPanel    = document.getElementById('newConvPanel');
var ncpBack         = document.getElementById('ncpBack');
var ncpScreen1      = document.getElementById('ncpScreen1');
var ncpScreen2      = document.getElementById('ncpScreen2');
var ncpUserSearch   = document.getElementById('ncpUserSearch');
var ncpResults      = document.getElementById('ncpResults');
var newConvBackdrop = document.getElementById('newConvBackdrop');
var btnCloseModal   = document.getElementById('btnCloseModal');
var userSearch      = document.getElementById('userSearch');
var userResults     = document.getElementById('userResults');

var ncpTimer = null;
var searchTimer = null;
var convListInitted = false;
var fetchingConvs = false;
var fetchingConvTyping = false;

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
                pinned:   [on ? 'Conversación fijada'     : 'Fijado quitado'],
                favorite: [on ? 'Añadido a favoritos'     : 'Eliminado de favoritos'],
                muted:    [on ? 'Conversación silenciada' : 'Notificaciones activadas'],
            };
            message.success(msgs[meta][0]);
            loadConversations();
        });
}

function convLastPreview(c) {
    if (c.last_deleted_for_all == 1) return '<i data-lucide="slash" class="conv-last-icon"></i> Mensaje eliminado';
    if (c.last_msg) return escapeHtml(c.last_msg.slice(0, 36) + (c.last_msg.length > 36 ? '…' : ''));
    var t = c.last_attachment_type;
    if (t === 'audio')    return '<i data-lucide="mic" class="conv-last-icon"></i> Audio';
    if (t === 'image')    return '<i data-lucide="image" class="conv-last-icon"></i> Imagen';
    if (t === 'location') return '<i data-lucide="map-pin" class="conv-last-icon"></i> Ubicación';
    if (t === 'contact')  return '<i data-lucide="user" class="conv-last-icon"></i> Contacto';
    if (t === 'file')     return '<i data-lucide="paperclip" class="conv-last-icon"></i> Archivo';
    return 'Sin mensajes';
}

function loadConversations() {
    if (fetchingConvs || document.hidden) return;
    fetchingConvs = true;
    fetch('../messages/get_conversations.php')
        .then(function(r) { return r.json(); })
        .then(function(res) {
            fetchingConvs = false;
            if (!res.ok) return;
            conversations = res.conversations;
            renderConvList(convSearch.value);
        })
        .catch(function() { fetchingConvs = false; });
}

function renderConvList(filter) {
    filter = (filter || '').toLowerCase();
    var filtered = conversations.filter(function(c) {
        return !filter || (c.other_name && c.other_name.toLowerCase().indexOf(filter) >= 0);
    });

    if (activeFilter === 'unread') {
        filtered = filtered.filter(function(c) { return parseInt(c.unread) > 0 || c.force_unread == 1; });
    } else if (activeFilter === 'favorites') {
        filtered = filtered.filter(function(c) { return c.is_favorite == 1; });
    }

    if (filtered.length === 0) {
        var emptyMsg  = activeFilter === 'favorites' ? 'Sin favoritos' : activeFilter === 'unread' ? 'Sin mensajes no leídos' : 'Sin conversaciones';
        var emptyIcon = activeFilter === 'favorites' ? 'star' : activeFilter === 'unread' ? 'mail' : 'message-circle';
        convList.innerHTML = '<div class="conv-empty"><i data-lucide="' + emptyIcon + '"></i><span>' + emptyMsg + '</span></div>';
        lucide.createIcons();
        return;
    }

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
        var lastMsg = convLastPreview(c);
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

        var forceUnread = c.force_unread == 1;
        var isUnread    = unread > 0 || forceUnread;
        var unreadCls   = isUnread ? ' conv-unread' : '';
        var enterCls    = !convListInitted ? ' conv-entering' : '';
        var delayStyle  = !convListInitted ? ' style="animation-delay:' + (Math.min(i, 8) * 42) + 'ms"' : '';

        var flags = '';
        if (c.is_pinned == 1)   flags += '<i data-lucide="pin" class="conv-flag"></i>';
        if (c.is_favorite == 1) flags += '<i data-lucide="star" class="conv-flag fav"></i>';
        if (c.is_muted == 1)    flags += '<i data-lucide="bell-off" class="conv-flag muted"></i>';

        html += '<div class="conv-item' + isActive + unreadCls + enterCls + '" data-id="' + c.id + '" data-name="' + encodeURIComponent(name) + '"' + delayStyle + '>';
        html += '<div class="conv-avatar" style="background-color:' + color + '">' + ini + '</div>';
        html += '<div class="conv-info">';
        html += '<div class="conv-name">' + escapeHtml(name) + (flags ? '<span class="conv-flags">' + flags + '</span>' : '') + '</div>';
        if (c.is_typing == 1) {
            html += '<div class="conv-last conv-typing"><span class="conv-typing-dots"><span></span><span></span><span></span></span><span>Escribiendo...</span></div>';
        } else {
            html += '<div class="conv-last">' + lastMsg + '</div>';
        }
        html += '</div>';
        html += '<div class="conv-meta">';
        if (time) html += '<span class="conv-time">' + time + '</span>';
        if (unread > 0) html += '<span class="conv-badge">' + unread + '</span>';
        else if (forceUnread) html += '<span class="conv-badge-dot"></span>';
        html += '</div>';
        html += '<button class="conv-actions-trigger" aria-label="Acciones"><i data-lucide="chevron-down"></i></button>';
        html += '</div>';
    }
    convList.innerHTML = html;
    convListInitted = true;

    convList.querySelectorAll('.conv-item').forEach(function(el) {
        var cid = parseInt(el.getAttribute('data-id'));
        var state = convActivityActive[cid];
        if (state) {
            var lastEl = el.querySelector('.conv-last');
            if (lastEl) {
                if (state === 'recording') {
                    lastEl.className = 'conv-last conv-recording';
                    lastEl.innerHTML = '<span class="conv-rec-dot"></span>'
                        + '<div class="conv-rec-waves"><span></span><span></span><span></span><span></span><span></span></div>'
                        + '<span>Grabando audio...</span>';
                } else if (state === 'typing') {
                    lastEl.className = 'conv-last conv-typing';
                    lastEl.innerHTML = '<span class="conv-typing-dots"><span></span><span></span><span></span></span><span>Escribiendo...</span>';
                }
            }
        }
    });

    convList.querySelectorAll('.conv-item').forEach(function(el) {
        el.addEventListener('click', function(e) {
            if (e.target.closest('.conv-actions-trigger')) return;
            openConversation(parseInt(el.getAttribute('data-id')), decodeURIComponent(el.getAttribute('data-name')));
        });
    });

    lucide.createIcons({ nodes: [convList] });
}

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

convSearch.addEventListener('input', function() {
    renderConvList(this.value);
});

var convActivityActive = {};

function pollConvTyping() {
    if (fetchingConvTyping || document.hidden) return;
    fetchingConvTyping = true;
    fetch('../messages/poll_conv_typing.php')
        .then(function(r) { return r.json(); })
        .then(function(res) {
            fetchingConvTyping = false;
            if (!res.ok) return;
            var newActivity = {};
            (res.recording || []).forEach(function(id) { newActivity[id] = 'recording'; });
            (res.typing || []).forEach(function(id) { if (!newActivity[id]) newActivity[id] = 'typing'; });

            document.querySelectorAll('#convList .conv-item').forEach(function(el) {
                var id = parseInt(el.getAttribute('data-id'));
                var lastEl = el.querySelector('.conv-last');
                if (!lastEl) return;

                var oldState = convActivityActive[id] || null;
                var newState = newActivity[id] || null;
                if (oldState === newState) return;

                if (newState === 'typing') {
                    lastEl.className = 'conv-last conv-typing';
                    lastEl.innerHTML = '<span class="conv-typing-dots"><span></span><span></span><span></span></span><span>Escribiendo...</span>';
                } else if (newState === 'recording') {
                    lastEl.className = 'conv-last conv-recording';
                    lastEl.innerHTML = '<span class="conv-rec-dot"></span>'
                        + '<div class="conv-rec-waves"><span></span><span></span><span></span><span></span><span></span></div>'
                        + '<span>Grabando audio...</span>';
                } else {
                    var conv = null;
                    for (var i = 0; i < conversations.length; i++) {
                        if (conversations[i].id == id) { conv = conversations[i]; break; }
                    }
                    lastEl.className = 'conv-last';
                    lastEl.innerHTML = conv ? convLastPreview(conv) : 'Sin mensajes';
                    lucide.createIcons({ nodes: [lastEl] });
                }
            });
            convActivityActive = newActivity;
        })
        .catch(function() { fetchingConvTyping = false; });
}

setInterval(pollConvTyping, 500);

document.querySelectorAll('.filter-chip').forEach(function(chip) {
    chip.addEventListener('click', function() {
        document.querySelectorAll('.filter-chip').forEach(function(c) { c.classList.remove('active'); });
        chip.classList.add('active');
        activeFilter = chip.dataset.filter;
        renderConvList(convSearch.value);
    });
});

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

function startConversation(userId) {
    var fd = new FormData();
    fd.append('user_id', userId);
    fetch('../messages/new_conversation.php', { method: 'POST', body: fd })
        .then(function(r) { return r.json(); })
        .then(function(res) {
            if (!res.ok) return;
            var conv = res.conversation;
            var exists = false;
            for (var i = 0; i < conversations.length; i++) {
                if (conversations[i].id == conv.id) { exists = true; break; }
            }
            if (!exists) conversations.unshift(conv);
            closeModal();
            renderConvList('');
            convSearch.value = '';
            openConversation(conv.id, conv.other_name);
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
    ncpUserSearch.value = '';
    ncpResults.innerHTML = '<div class="ncp-hint"><i data-lucide="user-round-search"></i><span>Escribe para buscar</span></div>';
    lucide.createIcons({ nodes: [ncpResults] });
    setTimeout(function() { ncpUserSearch.focus(); }, 50);
});

ncpUserSearch.addEventListener('input', function() {
    clearTimeout(ncpTimer);
    var q = this.value.trim();
    if (q.length < 2) {
        ncpResults.innerHTML = '<div class="ncp-hint"><i data-lucide="user-round-search"></i><span>Escribe para buscar</span></div>';
        lucide.createIcons({ nodes: [ncpResults] });
        return;
    }
    ncpResults.innerHTML = '<div class="ncp-loading"><span></span><span></span><span></span></div>';
    ncpTimer = setTimeout(function() {
        fetch('../messages/search_users.php?q=' + encodeURIComponent(q))
            .then(function(r) { return r.json(); })
            .then(function(res) {
                if (!res.ok || !res.users.length) {
                    ncpResults.innerHTML = '<div class="ncp-hint"><i data-lucide="user-x"></i><span>Sin resultados para "' + escapeHtml(q) + '"</span></div>';
                    lucide.createIcons({ nodes: [ncpResults] });
                    return;
                }
                ncpResults.innerHTML = res.users.map(function(u, idx) {
                    var col = avatarColor(u.name);
                    var ini = initials(u.name);
                    return '<div class="ncp-user-item" data-uid="' + u.id + '" style="animation-delay:' + (idx * 40) + 'ms">' +
                        '<div class="ncp-user-avatar" style="background-color:' + col + '">' + escapeHtml(ini) + '</div>' +
                        '<span class="ncp-user-name">' + escapeHtml(u.name) + '</span>' +
                        '<i data-lucide="chevron-right" class="ncp-user-arrow"></i>' +
                    '</div>';
                }).join('');
                lucide.createIcons({ nodes: [ncpResults] });
            });
    }, 250);
});

ncpResults.addEventListener('click', function(e) {
    var item = e.target.closest('.ncp-user-item[data-uid]');
    if (!item) return;
    closeNcp(function() { startConversation(parseInt(item.dataset.uid)); });
});

btnCloseModal.addEventListener('click', closeModal);

newConvBackdrop.addEventListener('click', function(e) {
    if (e.target === newConvBackdrop) closeModal();
});

function markConvUnread(convId, isCurrentlyForced) {
    var fd = new FormData();
    fd.append('conv_id', convId);
    if (isCurrentlyForced) fd.append('action', 'reset');
    fetch('../messages/mark_unread.php', { method: 'POST', body: fd })
        .then(function(r) { return r.json(); })
        .then(function(res) {
            if (!res.ok) return;
            for (var i = 0; i < conversations.length; i++) {
                if (conversations[i].id == convId) {
                    conversations[i].force_unread = res.force_unread;
                    break;
                }
            }
            renderConvList(convSearch.value);
            message.success(res.force_unread ? 'Marcado como no leído' : 'Marcado como leído');
        });
}

function blockUser(convId, isCurrentlyBlocked) {
    var conv = null;
    for (var i = 0; i < conversations.length; i++) {
        if (conversations[i].id == convId) { conv = conversations[i]; break; }
    }
    if (!conv) return;
    var otherId = (conv.user1_id == currentUid) ? conv.user2_id : conv.user1_id;
    var fd = new FormData();
    fd.append('target_id', otherId);
    fd.append('action', isCurrentlyBlocked ? 'unblock' : 'block');
    fetch('../messages/block_user.php', { method: 'POST', body: fd })
        .then(function(r) { return r.json(); })
        .then(function(res) {
            if (!res.ok) return;
            for (var i = 0; i < conversations.length; i++) {
                if (conversations[i].id == convId) {
                    conversations[i].is_blocked = res.blocked ? 1 : 0;
                    break;
                }
            }
            if (convId == activeConvId) updateBlockedNotice(res.blocked, activeConvName);
            message.success(res.blocked ? 'Usuario bloqueado' : 'Usuario desbloqueado');
        });
}

function deleteConv(convId) {
    openDeleteConvModal(convId);
}

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
