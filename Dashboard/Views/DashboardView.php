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
  <link rel="stylesheet" href="../css/dashboard/QuickNotesDashboard.css">
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

      <div class="dash-search-outer" id="dashSearchOuter">
        <div class="dash-search-wrap" id="dashSearchWrap">
          <i data-lucide="search" class="dash-search-icon" id="dashSearchIconBtn" aria-hidden="true"></i>
          <input type="text" class="dash-search-input" id="dashSearchInput"
                 placeholder="Buscar en NootraLite..." aria-label="Buscar en NootraLite"
                 autocomplete="off" spellcheck="false">
          <button class="dash-search-clear" id="dashSearchClear" aria-label="Limpiar búsqueda" style="display:none">
            <i data-lucide="x"></i>
          </button>
          <kbd class="dash-search-kbd" aria-hidden="true">/</kbd>
        </div>
        <button class="dash-search-cancel" id="dashSearchCancel" aria-label="Cancelar búsqueda">
          <i data-lucide="x"></i>
        </button>
        <div class="dash-search-drop" id="dashSearchDrop"></div>
      </div>

      <div class="dash-bell-wrap">
        <button class="dash-topbar-icon-btn" id="dashBellBtn" aria-label="Notificaciones">
          <i data-lucide="bell" id="dashBellIcon"></i>
          <span class="dash-bell-badge" id="dashBellBadge"></span>
        </button>
        <div class="dash-notif-dropdown" id="dashNotifDropdown">
          <div class="dash-notif-handle" id="dashNotifHandle" aria-hidden="true"></div>
          <div class="dash-notif-head">
            <span class="dash-notif-title">Notificaciones</span>
            <button class="dash-notif-mark-btn" id="dashNotifMark" aria-label="Marcar como vistas">
              <i data-lucide="check-check"></i>
              <span>Limpiar</span>
            </button>
          </div>
          <div class="dash-notif-body" id="dashNotifBody">
            <div class="dash-notif-empty">
              <i data-lucide="bell-off"></i>
              <span>Sin notificaciones</span>
            </div>
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
<script>
window._dashPrefetch = fetch('../Dashboard/get_dashboard.php')
    .then(function(r){ return r.json(); })
    .catch(function(){ return {}; });
</script>
    <?php include '../includes/dashboard/GreetingDashboard.php'; ?>
    <?php include '../includes/dashboard/StatsDashboard.php'; ?>
    <div class="dash-lower">
      <div class="dash-center">
        <?php include '../includes/dashboard/ActivityDashboard.php'; ?>
        <?php include '../includes/dashboard/MessagesDashboard.php'; ?>
      </div>
      <aside class="dash-right">
        <?php include '../includes/dashboard/QuickLinksDashboard.php'; ?>
        <?php include '../includes/dashboard/CalendarDashboard.php'; ?>
      </aside>
    </div>
    <?php include '../includes/dashboard/LastBooksViewDashboard.php'; ?>
    <?php include '../includes/dashboard/LastNotesViewDashboard.php'; ?>
    <?php include '../includes/dashboard/LastQuickNotesDashboard.php'; ?>
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


</script>
<div id="dashNotifCtx" class="dash-notif-ctx"></div>

<script src="../js/includes/sidebar.js"></script>
<script src="../js/includes/toast.js"></script>
<script src="../js/dashboard/dashboard.js"></script>
<script>
lucide.createIcons();
(function() {
    var show = function() {
        document.body.classList.add('page-entered');
        document.documentElement.style.visibility = '';
        var bar = document.createElement('div');
        bar.className = 'page-bar';
        document.body.appendChild(bar);
        bar.addEventListener('animationend', function() { if (bar.parentNode) bar.remove(); }, { once: true });
    };
    var img = document.querySelector('img.logo-icon');
    if (!img || img.complete) { document.fonts.ready.then(show); return; }
    var t = setTimeout(function(){ document.fonts.ready.then(show); }, 350);
    img.onload = img.onerror = function() { clearTimeout(t); document.fonts.ready.then(show); };
})();
</script>
</body>
</html>
