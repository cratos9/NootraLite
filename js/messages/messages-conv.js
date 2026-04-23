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

function loadConversations() {
    fetch('../messages/get_conversations.php')
        .then(function(r) { return r.json(); })
        .then(function(res) {
            if (!res.ok) return;
            conversations = res.conversations;
            renderConvList(convSearch.value);
        });
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
        var emptyMsg = activeFilter === 'favorites' ? 'Sin favoritos' : activeFilter === 'unread' ? 'Sin mensajes no leídos' : 'Sin conversaciones';
        convList.innerHTML = '<div class="conv-empty">' + emptyMsg + '</div>';
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
        html += '<div class="conv-avatar" style="background:' + color + '">' + ini + '</div>';
        html += '<div class="conv-info">';
        html += '<div class="conv-name">' + escapeHtml(name) + (flags ? '<span class="conv-flags">' + flags + '</span>' : '') + '</div>';
        html += '<div class="conv-last">' + escapeHtml(lastMsg) + '</div>';
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
    setTimeout(function() { ncpUserSearch.focus(); }, 50);
});

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
    if (!window.confirm('¿Eliminar esta conversación? No se puede deshacer.')) return;
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
        });
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
