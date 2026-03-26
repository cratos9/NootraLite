<div class="sidebar-overlay" id="sidebar-overlay"></div>
<aside class="sidebar">
    <div class="sidebar-logo">
        <div class="logo-icon">N</div>
        <span class="logo-text">NOOTRA</span>
    </div>
    <nav class="sidebar-nav">
        <a class="nav-item <?= ($activePage ?? '') === 'dashboard' ? 'active' : '' ?>" href="/nootralite/dashboard/index.php"><i data-lucide="house"></i> Dashboard</a>
        <a class="nav-item <?= ($activePage ?? '') === 'calendar' ? 'active' : '' ?>" href="/nootralite/calendar/calendar.php"><i data-lucide="calendar-days"></i> Calendario</a>
        <a class="nav-item <?= ($activePage ?? '') === 'notebooks' ? 'active' : '' ?>" href="#"><i data-lucide="book-open"></i> Cuadernos</a>
        <a class="nav-item <?= ($activePage ?? '') === 'tasks' ? 'active' : '' ?>" href="#"><i data-lucide="check-square"></i> Tareas</a>
        <a class="nav-item <?= ($activePage ?? '') === 'quick-notes' ? 'active' : '' ?>" href="#"><i data-lucide="notepad-text"></i> Notas rápidas</a>
    </nav>
    <nav class="sidebar-nav sidebar-nav-bottom">
        <a class="nav-item <?= ($activePage ?? '') === 'profile' ? 'active' : '' ?>" href="/nootralite/User/profile.php"><i data-lucide="user"></i> Perfil</a>
        <a class="nav-item <?= ($activePage ?? '') === 'settings' ? 'active' : '' ?>" href="#"><i data-lucide="settings"></i> Configuración</a>
    </nav>
</aside>
