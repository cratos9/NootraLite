function escHtml(s) {
    if (!s) return '';
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

var msgPrivacyRevealed = (function() {
    try { return localStorage.getItem('nootra_msg_privacy') !== 'false'; } catch(e) { return true; }
})();

function applyPrivacyState(animate) {
    var card   = document.getElementById('recentMsgCard');
    var toggle = document.getElementById('msgPrivacyToggle');
    var lbl    = document.getElementById('dptLabel');
    var sw     = document.getElementById('dptSwitch');
    var icon   = document.getElementById('dptIconWrap');
    if (!card) return;
    card.classList.toggle('dash-msg-revealed', msgPrivacyRevealed);
    if (toggle) toggle.classList.toggle('visible', msgPrivacyRevealed);
    if (lbl) lbl.textContent = msgPrivacyRevealed ? 'Visible' : 'Privado';
    if (sw)  sw.setAttribute('aria-checked', msgPrivacyRevealed ? 'true' : 'false');
    if (animate && icon) {
        icon.classList.remove('dpt-pop');
        void icon.offsetWidth;
        icon.classList.add('dpt-pop');
    }
}

function buildPreviewInner(c) {
    if (c.is_recording == true || c.is_recording == 1) {
        return '<span class="dash-msg-recording">' +
               '<span class="dash-msg-rec-dot"></span>' +
               '<div class="dash-msg-rec-waves"><span></span><span></span><span></span><span></span><span></span></div>' +
               'Grabando audio...</span>';
    }
    if (parseInt(c.is_typing) === 1) {
        return '<span class="dash-msg-typing">' +
               '<span class="dash-msg-typing-dots">' +
               '<span class="dash-msg-typing-dot"></span>' +
               '<span class="dash-msg-typing-dot"></span>' +
               '<span class="dash-msg-typing-dot"></span>' +
               '</span>Escribiendo...</span>';
    }
    var pfx  = c.is_mine ? '<span class="dash-msg-me">Tú:</span> ' : '';
    var text = pfx + escHtml(c.last_preview || '');
    return '<span class="dash-privacy-bars"><span></span><span></span><span></span></span>' +
           '<span class="dash-privacy-text">' + text + '</span>';
}

function buildMsgRow(c, i) {
    var hasUnread = c.is_unread || parseInt(c.unread) > 0;
    var delay     = 'animation:dashFadeUp .28s cubic-bezier(.34,1.56,.64,1) ' + (i * .07) + 's both';

    return '<a class="dash-msg-row' + (hasUnread ? ' unread' : '') + '" href="../messages/messages.php" style="' + delay + '">' +
        '<div class="dash-msg-av-wrap">' +
        '<div class="dash-msg-av" style="background-color:' + escHtml(c.avatar_color) + '">' + escHtml(c.initials) + '</div>' +
        (c.is_online == 1 ? '<span class="dash-msg-online"></span>' : '') +
        '</div>' +
        '<div class="dash-msg-body">' +
        '<span class="dash-msg-name">' + escHtml(c.other_name) + '</span>' +
        '<div class="dash-msg-preview">' + buildPreviewInner(c) + '</div>' +
        '</div>' +
        '<div class="dash-msg-right">' +
        (c.time_fmt ? '<span class="dash-msg-time">' + escHtml(c.time_fmt) + '</span>' : '') +
        (hasUnread ? '<span class="dash-msg-badge">' + (parseInt(c.unread) > 9 ? '9+' : (parseInt(c.unread) || '•')) + '</span>' : '') +
        '</div>' +
        '</a>';
}

/* ── cache y polling ── */
var _dashMsgCache    = [];
var _dashPollId      = null;
var _dashPollFetch   = false;

function _updateHeaderBadge(total) {
    var badge = document.getElementById('msgBadge');
    if (!badge) return;
    badge.textContent    = total > 9 ? '9+' : total;
    badge.style.display  = total > 0 ? 'inline-flex' : 'none';
}

function _diffRows(fresh) {
    var list = document.getElementById('dashMsgList');
    if (!list) return;

    // si cambiaron los IDs o el orden → re-render completo sin stagger
    var freshIds = fresh.map(function(c) { return c.id; }).join(',');
    var cacheIds = _dashMsgCache.map(function(c) { return c.id; }).join(',');
    if (freshIds !== cacheIds) {
        var html = '';
        fresh.forEach(function(c, i) { html += buildMsgRow(c, i); });
        list.innerHTML = html;
        lucide.createIcons();
        applyPrivacyState();
        return;
    }

    var rows = list.querySelectorAll('.dash-msg-row');
    fresh.forEach(function(c, i) {
        var prev = _dashMsgCache[i];
        var row  = rows[i];
        if (!row || !prev) return;

        // online dot
        if (String(c.is_online) !== String(prev.is_online)) {
            var dot = row.querySelector('.dash-msg-online');
            if (c.is_online == 1 && !dot) {
                var avw = row.querySelector('.dash-msg-av-wrap');
                if (avw) { var d = document.createElement('span'); d.className = 'dash-msg-online'; avw.appendChild(d); }
            } else if (c.is_online != 1 && dot) {
                dot.remove();
            }
        }

        // preview (typing / recording / nuevo mensaje)
        var prevChanged = String(c.is_typing)    !== String(prev.is_typing)    ||
                          String(c.is_recording) !== String(prev.is_recording) ||
                          c.last_preview !== prev.last_preview ||
                          String(c.is_mine) !== String(prev.is_mine);
        if (prevChanged) {
            var previewEl = row.querySelector('.dash-msg-preview');
            if (previewEl) {
                previewEl.innerHTML = buildPreviewInner(c);
                lucide.createIcons();
                applyPrivacyState();
                // flash solo si llegó mensaje nuevo (no typing/recording)
                if (c.last_preview !== prev.last_preview) {
                    previewEl.classList.remove('dash-preview-flash');
                    void previewEl.offsetWidth;
                    previewEl.classList.add('dash-preview-flash');
                }
            }
        }

        // unread badge + clase
        var hasUnread  = c.is_unread  || parseInt(c.unread)  > 0;
        var hadUnread  = prev.is_unread || parseInt(prev.unread) > 0;
        if (hasUnread !== hadUnread || c.unread !== prev.unread) {
            row.classList.toggle('unread', hasUnread);
            var right = row.querySelector('.dash-msg-right');
            if (right) {
                var badge = right.querySelector('.dash-msg-badge');
                if (hasUnread && !badge) {
                    var b = document.createElement('span');
                    b.className   = 'dash-msg-badge';
                    b.textContent = parseInt(c.unread) > 9 ? '9+' : (parseInt(c.unread) || '•');
                    right.appendChild(b);
                } else if (!hasUnread && badge) {
                    badge.remove();
                } else if (hasUnread && badge) {
                    badge.textContent = parseInt(c.unread) > 9 ? '9+' : (parseInt(c.unread) || '•');
                }
            }
        }

        // tiempo
        if (c.time_fmt !== prev.time_fmt) {
            var timeEl = row.querySelector('.dash-msg-time');
            if (timeEl) timeEl.textContent = c.time_fmt;
        }
    });
}

function _pollDashboard() {
    if (_dashPollFetch) return;
    _dashPollFetch = true;
    fetch('../Dashboard/get_recent_messages.php')
        .then(function(r) { return r.json(); })
        .then(function(res) {
            _dashPollFetch = false;
            if (!res.ok) return;
            _updateHeaderBadge(res.total_unread || 0);
            _diffRows(res.conversations || []);
            _dashMsgCache = res.conversations || [];
        })
        .catch(function() { _dashPollFetch = false; });
}

function _startPoll() {
    if (_dashPollId) return;
    _dashPollId = setInterval(_pollDashboard, 3000);
}

function _stopPoll() {
    if (_dashPollId) { clearInterval(_dashPollId); _dashPollId = null; }
}

function loadRecentMessages() {
    fetch('../Dashboard/get_recent_messages.php')
        .then(function(r) { return r.json(); })
        .then(function(res) {
            if (!res.ok) return;
            _updateHeaderBadge(res.total_unread || 0);

            var list = document.getElementById('dashMsgList');
            if (!list) return;

            if (!res.conversations || !res.conversations.length) {
                list.innerHTML = '<div class="dash-msg-empty"><i data-lucide="message-circle-off"></i><span>Sin conversaciones aún</span></div>';
                lucide.createIcons();
                return;
            }

            var html = '';
            res.conversations.forEach(function(c, i) { html += buildMsgRow(c, i); });
            list.innerHTML = html;
            lucide.createIcons();
            applyPrivacyState();

            _dashMsgCache = res.conversations;
            _startPoll();
        })
        .catch(function() {
            var list = document.getElementById('dashMsgList');
            if (list) {
                list.innerHTML = '<div class="dash-msg-empty"><i data-lucide="wifi-off"></i><span>No se pudo cargar</span></div>';
                lucide.createIcons();
            }
        });
}

var _privBtn = document.getElementById('msgPrivacyToggle');
if (_privBtn) {
    _privBtn.addEventListener('click', function() {
        msgPrivacyRevealed = !msgPrivacyRevealed;
        try { localStorage.setItem('nootra_msg_privacy', String(msgPrivacyRevealed)); } catch(e) {}
        applyPrivacyState(true);
    });
}

document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        _stopPoll();
    } else {
        _pollDashboard();
        _startPoll();
    }
});

applyPrivacyState(false);
loadRecentMessages();
