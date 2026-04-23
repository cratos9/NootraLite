// toggle sidebar mobile
var sidebar = document.querySelector('.sidebar');
var overlay = document.getElementById('sidebar-overlay');
var hamburger = document.querySelector('.btn-hamburger');

if (hamburger) {
    hamburger.addEventListener('click', function() {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('show');
        document.body.style.overflow = sidebar.classList.contains('open') ? 'hidden' : '';
    });
}

if (overlay) {
    overlay.addEventListener('click', function() {
        sidebar.classList.remove('open');
        overlay.classList.remove('show');
        document.body.style.overflow = '';
    });
}

var closeBtn = document.querySelector('.sidebar-close');
if (closeBtn) closeBtn.addEventListener('click', function() {
    sidebar.classList.remove('open'); overlay.classList.remove('show'); document.body.style.overflow = '';
});

// cerrar con esc
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
        overlay.classList.remove('show');
        document.body.style.overflow = '';
    }
});

// polling notificaciones mensajes
var _sntStored = sessionStorage.getItem('snt_seen');
var prevUnread = _sntStored !== null ? parseInt(_sntStored, 10) : -1;
var navBadge = document.getElementById('navMsgBadge');
var bottomBadge = document.getElementById('bottomMsgBadge');
var navMsgItem = document.getElementById('messagesNavItem');
var bottomMsgItem = document.getElementById('messagesBottomItem');

function badgeText(n) {
    return n > 99 ? '99+' : n > 9 ? '9+' : String(n);
}

function unreadLabel(n) {
    if (n <= 0) return 'Mensajes';
    return 'Mensajes, ' + n + ' sin leer';
}

function applyUnreadState(linkEl, n) {
    if (!linkEl) return;
    var hasUnread = n > 0;
    linkEl.classList.toggle('has-unread', hasUnread);
    linkEl.setAttribute('aria-label', unreadLabel(n));
    if (linkEl.classList.contains('nav-item')) {
        linkEl.setAttribute('data-tooltip', hasUnread ? 'Mensajes (' + n + ')' : 'Mensajes');
    }
    linkEl.title = unreadLabel(n);
}

function bumpBadge(el) {
    if (!el) return;
    el.classList.remove('badge-bump');
    void el.offsetWidth;
    el.classList.add('badge-bump');
    el.addEventListener('animationend', function h() {
        el.removeEventListener('animationend', h);
        el.classList.remove('badge-bump');
    }, { once: true });
}

function checkMsgNotifs() {
    fetch('../messages/poll_notifications.php')
        .then(function(r) { return r.json(); })
        .then(function(res) {
            if (!res.ok) return;
            var n = res.unread || 0;
            var onMessages = window.location.pathname.indexOf('messages') !== -1;
            // primer poll de la sesión: establecer baseline sin toast
            var isFirst = prevUnread === -1;
            var increased = !isFirst && n > prevUnread;
            var text = badgeText(n);

            applyUnreadState(navMsgItem, n);
            applyUnreadState(bottomMsgItem, n);

            if (navBadge) {
                navBadge.textContent = text;
                navBadge.style.display = n > 0 ? 'flex' : 'none';
                if (increased && n > 0) bumpBadge(navBadge);
            }
            if (bottomBadge) {
                bottomBadge.textContent = text;
                bottomBadge.style.display = n > 0 ? 'flex' : 'none';
                if (increased && n > 0) bumpBadge(bottomBadge);
            }
            if (increased && !onMessages) {
                showMsgToast(n);
            }
            prevUnread = n;
            sessionStorage.setItem('snt_seen', String(n));
        })
        .catch(function() {});
}

function showMsgToast(n) {
    var existing = document.querySelector('.sidebar-notif-toast');
    if (existing) existing.remove();
    var count = n > 9 ? '9+' : n;
    var label = n !== 1 ? 'mensajes' : 'mensaje';
    var el = document.createElement('div');
    el.className = 'sidebar-notif-toast';
    el.innerHTML =
        '<div class="snt-icon-wrap"><div class="snt-icon-circle"><i data-lucide="message-circle"></i></div></div>' +
        '<div class="snt-body">' +
            '<div class="snt-title"><span class="snt-count">' + count + '</span> ' + label + ' sin leer</div>' +
            '<a class="snt-link" href="../messages/messages.php">Ver mensajes <i data-lucide="arrow-right"></i></a>' +
        '</div>' +
        '<button class="snt-close" aria-label="Cerrar"><i data-lucide="x"></i></button>';
    document.body.appendChild(el);
    if (typeof lucide !== 'undefined') lucide.createIcons();
    var gone = false;
    function dismiss() {
        if (gone) return; gone = true;
        el.style.opacity = '0';
        el.style.transform = 'translateY(8px)';
        el.style.transition = 'opacity 0.2s, transform 0.2s';
        setTimeout(function() { if (el.parentNode) el.remove(); }, 220);
    }
    el.querySelector('.snt-close').addEventListener('click', dismiss);
    setTimeout(dismiss, 4500);
}

checkMsgNotifs();
setInterval(checkMsgNotifs, 8000);
