<div class="sidebar-overlay" id="sidebar-overlay"></div>
<aside class="sidebar">
    <div class="sidebar-logo">
        <div class="logo-icon">N</div>
        <span class="logo-text">NOOTRA</span>
    </div>
    <nav class="sidebar-nav">
        <a class="nav-item <?= ($activePage ?? '') === 'dashboard' ? 'active' : '' ?>" href="#"><i data-lucide="house"></i> Dashboard</a>
        <a class="nav-item <?= ($activePage ?? '') === 'calendar' ? 'active' : '' ?>" href="/calendar/calendar.php"><i data-lucide="calendar-days"></i> Calendario</a>
        <a class="nav-item <?= ($activePage ?? '') === 'notebooks' ? 'active' : '' ?>" href="#"><i data-lucide="book-open"></i> Cuadernos</a>
    </nav>
</aside>
