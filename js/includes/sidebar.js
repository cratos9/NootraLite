// toggle sidebar mobile
var sidebar = document.querySelector('.sidebar');
var overlay = document.getElementById('sidebar-overlay');
var hamburger = document.querySelector('.btn-hamburger');

if (hamburger) {
    hamburger.addEventListener('click', function() {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('show');
    });
}

if (overlay) {
    overlay.addEventListener('click', function() {
        sidebar.classList.remove('open');
        overlay.classList.remove('show');
    });
}

// cerrar con esc
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
        overlay.classList.remove('show');
    }
});
