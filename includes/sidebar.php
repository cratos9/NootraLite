<script>if(localStorage.getItem('theme')==='light')document.documentElement.classList.add('light-mode')</script>
<div class="sidebar-overlay" id="sidebar-overlay"></div>
<aside class="sidebar">
    <div class="sidebar-logo">
        <div class="logo-icon">N</div>
        <span class="logo-text">NOOTRA</span>
    </div>
    <nav class="sidebar-nav">
        <a class="nav-item <?= ($activePage ?? '') === 'dashboard' ? 'active' : '' ?>" href="/nootralite/dashboard/index.php">
            <i data-lucide="house"></i> <span>Dashboard</span>
        </a>
        <a class="nav-item <?= ($activePage ?? '') === 'calendar' ? 'active' : '' ?>" href="/nootralite/calendar/calendar.php">
            <i data-lucide="calendar-days"></i> <span>Calendario</span>
        </a>
        <a class="nav-item <?= ($activePage ?? '') === 'notebooks' ? 'active' : '' ?>" href="#">
            <i data-lucide="book-open"></i> <span>Cuadernos</span>
        </a>
        <a class="nav-item <?= ($activePage ?? '') === 'tasks' ? 'active' : '' ?>" href="#">
            <i data-lucide="check-square"></i> <span>Tareas</span>
        </a>
        <a class="nav-item <?= ($activePage ?? '') === 'quick-notes' ? 'active' : '' ?>" href="#">
            <i data-lucide="notepad-text"></i> <span>Notas rápidas</span>
        </a>
    </nav>
    <nav class="sidebar-nav sidebar-nav-bottom">
        <a class="nav-item <?= ($activePage ?? '') === 'profile' ? 'active' : '' ?>" href="/nootralite/User/profile.php">
            <i data-lucide="user"></i> <span>Perfil</span>
        </a>
        <a class="nav-item <?= ($activePage ?? '') === 'settings' ? 'active' : '' ?>" href="#">
            <i data-lucide="settings"></i> <span>Configuración</span>
        </a>
    </nav>
</aside>

<button class="btn-hamburger" aria-label="Menú"><i data-lucide="menu"></i></button>

<nav class="bottom-nav">
    <a class="bottom-nav-item <?= ($activePage ?? '') === 'dashboard' ? 'active' : '' ?>" href="/nootralite/dashboard/index.php">
        <i data-lucide="house"></i><span>Inicio</span>
    </a>
    <a class="bottom-nav-item <?= ($activePage ?? '') === 'calendar' ? 'active' : '' ?>" href="/nootralite/calendar/calendar.php">
        <i data-lucide="calendar-days"></i><span>Calendario</span>
    </a>
    <a class="bottom-nav-item <?= ($activePage ?? '') === 'tasks' ? 'active' : '' ?>" href="#">
        <i data-lucide="check-square"></i><span>Tareas</span>
    </a>
    <a class="bottom-nav-item <?= ($activePage ?? '') === 'notebooks' ? 'active' : '' ?>" href="#">
        <i data-lucide="book-open"></i><span>Cuadernos</span>
    </a>
    <a class="bottom-nav-item <?= ($activePage ?? '') === 'profile' ? 'active' : '' ?>" href="/nootralite/User/profile.php">
        <i data-lucide="user"></i><span>Perfil</span>
    </a>
</nav>
