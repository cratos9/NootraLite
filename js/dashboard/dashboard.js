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

function buildMsgRow(c, i) {
    var hasUnread = c.is_unread || parseInt(c.unread) > 0;
    var isTyping  = parseInt(c.is_typing) === 1;
    var delay     = 'animation:dashFadeUp .28s cubic-bezier(.34,1.56,.64,1) ' + (i * .07) + 's both';
    var anim      = i === 0 ? '' : ';';

    var previewInner;
    if (isTyping) {
        previewInner =
            '<span class="dash-msg-typing">' +
            '<span class="dash-msg-typing-dots">' +
            '<span class="dash-msg-typing-dot"></span>' +
            '<span class="dash-msg-typing-dot"></span>' +
            '<span class="dash-msg-typing-dot"></span>' +
            '</span>Escribiendo...</span>';
    } else {
        var pfx  = c.is_mine ? '<span class="dash-msg-me">Tú:</span> ' : '';
        var text = pfx + escHtml(c.last_preview || '');
        previewInner =
            '<span class="dash-privacy-bars"><span></span><span></span><span></span></span>' +
            '<span class="dash-privacy-text">' + text + '</span>';
    }

    return '<a class="dash-msg-row' + (hasUnread ? ' unread' : '') + '" href="../messages/messages.php" style="' + delay + '">' +
        '<div class="dash-msg-av-wrap">' +
        '<div class="dash-msg-av" style="background:linear-gradient(135deg,' + escHtml(c.avatar_from) + ',' + escHtml(c.avatar_to) + ')">' + escHtml(c.initials) + '</div>' +
        (c.is_online == 1 ? '<span class="dash-msg-online"></span>' : '') +
        '</div>' +
        '<div class="dash-msg-body">' +
        '<span class="dash-msg-name">' + escHtml(c.other_name) + '</span>' +
        '<div class="dash-msg-preview">' + previewInner + '</div>' +
        '</div>' +
        '<div class="dash-msg-right">' +
        (c.time_fmt ? '<span class="dash-msg-time">' + escHtml(c.time_fmt) + '</span>' : '') +
        (hasUnread ? '<span class="dash-msg-badge">' + (parseInt(c.unread) > 9 ? '9+' : (parseInt(c.unread) || '•')) + '</span>' : '') +
        '</div>' +
        '</a>';
}

function loadRecentMessages() {
    fetch('../Dashboard/get_recent_messages.php')
        .then(function(r) { return r.json(); })
        .then(function(res) {
            if (!res.ok) return;

            var badge = document.getElementById('msgBadge');
            if (badge) {
                badge.textContent = res.total_unread > 9 ? '9+' : res.total_unread;
                badge.style.display = res.total_unread > 0 ? 'inline-flex' : 'none';
            }

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

applyPrivacyState(false);
loadRecentMessages();
