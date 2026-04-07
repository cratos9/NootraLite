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
