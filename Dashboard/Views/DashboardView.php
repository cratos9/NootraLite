<!DOCTYPE html>
<html lang="es-MX">
<head>
  <script>document.documentElement.style.visibility='hidden';document.documentElement.style.background=localStorage.getItem('theme')==='light'?'#f0f2f8':'#0f0f1a'</script>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard · NootraLite</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
  <link rel="stylesheet" href="../css/includes/sidebar.css">
  <link rel="stylesheet" href="../css/includes/toast.css">
  <link rel="stylesheet" href="../css/dashboard/dashboard.css">
  <link rel="stylesheet" href="../css/dashboard/BooksDashboard.css">
</head>
<body>
<?php include '../includes/sidebar.php'; ?>
<div class="dash-wrap">

  <header class="dash-topbar">
    <div class="dash-topbar-left">
      <span class="dash-page-title">Dashboard</span>
      <span class="dash-date" id="dashDate"></span>
    </div>
    <div class="dash-topbar-right">

      <div class="dash-search-wrap">
        <i data-lucide="search" class="dash-search-icon"></i>
        <input type="text" class="dash-search-input" id="dashSearchInput"
               placeholder="Buscar en NootraLite..." aria-label="Buscar en NootraLite" readonly>
      </div>

      <div class="dash-bell-wrap">
        <button class="dash-topbar-icon-btn" id="dashBellBtn" aria-label="Notificaciones">
          <i data-lucide="bell"></i>
          <span class="dash-bell-dot" id="dashBellDot" style="display:none"></span>
        </button>
        <div class="dash-notif-dropdown" id="dashNotifDropdown" style="display:none">
          <div class="dash-notif-empty">
            <i data-lucide="bell-off"></i>
            <span>Sin notificaciones</span>
          </div>
        </div>
      </div>

      <button class="btn-theme" id="dashThemeToggle" aria-label="Cambiar tema">
        <i data-lucide="sun" class="icon-sun"></i>
        <i data-lucide="moon" class="icon-moon"></i>
      </button>

    </div>
  </header>

  <div class="dash-content">
    <?php include '../includes/dashboard/GreetingDashboard.php'; ?>
    <?php include '../includes/dashboard/StatsDashboard.php'; ?>
    <div class="dash-lower">
      <div class="dash-center">
        <?php include '../includes/dashboard/ActivityDashboard.php'; ?>
        <!-- mensajes: próxima sesión -->
      </div>
      <aside class="dash-right">
        <?php include '../includes/dashboard/QuickLinksDashboard.php'; ?>
        <!-- calendario: próxima sesión -->
      </aside>
    </div>
    <?php include '../includes/dashboard/LastBooksViewDashboard.php'; ?>
    <?php include '../includes/dashboard/LastNotesViewDashboard.php'; ?>
  </div>

</div>

<script>
var dashUid  = <?= (int)($_SESSION['user']['id'] ?? 0) ?>;
var dashName = <?= json_encode($_SESSION['user']['username'] ?? 'Usuario') ?>;

(function() {
    var el = document.getElementById('dashDate');
    if (!el) return;
    var opts = { weekday:'long', year:'numeric', month:'long', day:'numeric' };
    var txt = new Date().toLocaleDateString('es-MX', opts);
    el.textContent = txt.charAt(0).toUpperCase() + txt.slice(1);
})();

function dashToggleTheme() {
    var isLight = !document.body.classList.contains('light-mode');
    document.body.classList.toggle('light-mode', isLight);
    document.documentElement.classList.toggle('light-mode', isLight);
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
}
document.getElementById('dashThemeToggle').addEventListener('click', dashToggleTheme);

var dashBellBtn      = document.getElementById('dashBellBtn');
var dashBellDropdown = document.getElementById('dashNotifDropdown');
var dashBellOpen     = false;
if (dashBellBtn && dashBellDropdown) {
    dashBellBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        dashBellOpen = !dashBellOpen;
        if (dashBellOpen) {
            dashBellDropdown.style.display = '';
            dashBellDropdown.classList.add('open');
        } else {
            dashBellDropdown.classList.remove('open');
            dashBellDropdown.style.display = 'none';
        }
    });
    document.addEventListener('click', function() {
        if (!dashBellOpen) return;
        dashBellOpen = false;
        dashBellDropdown.classList.remove('open');
        dashBellDropdown.style.display = 'none';
    });
}
</script>
<script src="../js/includes/sidebar.js"></script>
<script src="../js/includes/toast.js"></script>
<script>lucide.createIcons(); document.fonts.ready.then(function(){ document.documentElement.style.visibility=''; });</script>
</body>
</html>
