<script>if(localStorage.getItem('theme')==='light')(document.body||document.documentElement).classList.add('light-mode')</script>
<div class="sidebar-overlay" id="sidebar-overlay"></div>
<aside class="sidebar">
    <div class="sidebar-logo">
        <div class="logo-icon">N</div>
        <span class="logo-text">NOOTRA</span>
        <button class="sidebar-close" aria-label="Cerrar"><i data-lucide="x"></i></button>
    </div>
    <nav class="sidebar-nav">
        <a class="nav-item <?= ($activePage ?? '') === 'dashboard' ? 'active' : '' ?>" href="/nootralite/dashboard/index.php" data-tooltip="Dashboard">
            <i data-lucide="house"></i> <span>Dashboard</span>
        </a>
        <a class="nav-item <?= ($activePage ?? '') === 'calendar' ? 'active' : '' ?>" href="/nootralite/calendar/calendar.php" data-tooltip="Calendario">
            <i data-lucide="calendar-days"></i> <span>Calendario</span>
        </a>
        <a class="nav-item <?= ($activePage ?? '') === 'notebooks' ? 'active' : '' ?>" href="#" data-tooltip="Cuadernos">
            <i data-lucide="book-open"></i> <span>Cuadernos</span>
        </a>
        <a class="nav-item <?= ($activePage ?? '') === 'tasks' ? 'active' : '' ?>" href="#" data-tooltip="Tareas">
            <i data-lucide="check-square"></i> <span>Tareas</span>
        </a>
        <a class="nav-item <?= ($activePage ?? '') === 'messages' ? 'active' : '' ?>" href="/nootralite/messages/messages.php" data-tooltip="Mensajes">
            <i data-lucide="message-circle"></i> <span>Mensajes</span>
        </a>
        <a class="nav-item <?= ($activePage ?? '') === 'quick-notes' ? 'active' : '' ?>" href="#" data-tooltip="Notas rápidas">
            <i data-lucide="notepad-text"></i> <span>Notas rápidas</span>
        </a>
    </nav>
    <nav class="sidebar-nav sidebar-nav-bottom">
        <a class="nav-item <?= ($activePage ?? '') === 'profile' ? 'active' : '' ?>" href="/nootralite/User/profile.php" data-tooltip="Perfil">
            <i data-lucide="user"></i> <span>Perfil</span>
        </a>
        <a class="nav-item <?= ($activePage ?? '') === 'settings' ? 'active' : '' ?>" href="#" data-tooltip="Configuración">
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
    <a class="bottom-nav-item <?= ($activePage ?? '') === 'messages' ? 'active' : '' ?>" href="/nootralite/messages/messages.php">
        <i data-lucide="message-circle"></i><span>Mensajes</span>
    </a>
    <a class="bottom-nav-item <?= ($activePage ?? '') === 'profile' ? 'active' : '' ?>" href="/nootralite/User/profile.php">
        <i data-lucide="user"></i><span>Perfil</span>
    </a>
</nav>
