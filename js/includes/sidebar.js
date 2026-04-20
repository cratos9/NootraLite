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
var prevUnread = 0;
var navBadge = document.getElementById('navMsgBadge');
var bottomBadge = document.getElementById('bottomMsgBadge');

function checkMsgNotifs() {
    fetch('../messages/poll_notifications.php')
        .then(function(r) { return r.json(); })
        .then(function(res) {
            if (!res.ok) return;
            var n = res.unread || 0;
            if (navBadge) {
                navBadge.textContent = n > 9 ? '9+' : n;
                navBadge.style.display = n > 0 ? 'flex' : 'none';
            }
            if (bottomBadge) {
                bottomBadge.textContent = n > 9 ? '9+' : n;
                bottomBadge.style.display = n > 0 ? 'flex' : 'none';
            }
            // toast solo si aumentaron y no estamos en mensajes
            if (n > prevUnread && window.location.pathname.indexOf('messages') === -1) {
                showMsgToast('Tienes ' + n + ' mensaje' + (n !== 1 ? 's' : '') + ' sin leer');
            }
            prevUnread = n;
        })
        .catch(function() {});
}

function showMsgToast(msg) {
    var el = document.createElement('div');
    el.className = 'sidebar-notif-toast';
    el.innerHTML = '<i data-lucide="message-circle" style="width:14px;height:14px;flex-shrink:0;color:#a78bfa"></i>' + msg;
    document.body.appendChild(el);
    if (typeof lucide !== 'undefined') lucide.createIcons();
    setTimeout(function() {
        el.style.opacity = '0';
        el.style.transition = 'opacity 0.2s';
        setTimeout(function() { el.remove(); }, 200);
    }, 3500);
}

checkMsgNotifs();
setInterval(checkMsgNotifs, 8000);
