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

    <section class="dash-greeting">
      <div class="dash-greet-left">
        <h2 class="dash-greet-h">¡<span id="dashGreetWord">Hola</span>, <span class="dash-greet-name" id="dashGreetName">Usuario</span>!</h2>
        <p class="dash-greet-sub" id="dashGreetSub"></p>
      </div>
      <!-- racha: sesión D24 opcional -->
    </section>

    <!-- secciones D4+ -->
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
    var isCurrentlyLight = document.body.classList.contains('light-mode') || document.documentElement.classList.contains('light-mode');
    var isLight = !isCurrentlyLight;
    document.body.classList.toggle('light-mode', isLight);
    document.documentElement.classList.toggle('light-mode', isLight);
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
}
document.getElementById('dashThemeToggle').addEventListener('click', dashToggleTheme);

(function() {
    var nameEl = document.getElementById('dashGreetName');
    var wordEl = document.getElementById('dashGreetWord');
    var subEl  = document.getElementById('dashGreetSub');
    if (nameEl && typeof dashName !== 'undefined') nameEl.textContent = dashName;

    var h = new Date().getHours();
    var pool;

    if (h >= 0 && h < 6) {
        pool = [
            ['Buenas noches',  'Todavía en pie — el silencio es tuyo a esta hora'],
            ['Buenas noches',  'La madrugada te pertenece — aprovecha la calma'],
            ['Trasnochando',   'Nadie más despierto, solo tú y tus pendientes'],
            ['Buenas noches',  'Noche larga — descansa cuando puedas'],
            ['Aún de pie',     'La madrugada tiene su magia — ¿qué estás construyendo?'],
        ];
    } else if (h < 12) {
        pool = [
            ['Buenos días',    'Empieza bien el día — revisa tus tareas pendientes'],
            ['Buenos días',    'Un nuevo día, nuevas oportunidades'],
            ['Buenos días',    '¿Listo para lo que viene hoy?'],
            ['Buenos días',    'Mañana despejada, mente fresca — a por ello'],
            ['Buenos días',    'El día es tuyo — ¿qué harás primero?'],
            ['Buenos días',    'Café en mano y a conquistar el día'],
            ['Buenos días',    'Hoy puede ser un gran día — depende de ti'],
            ['Buenos días',    'La mañana es el mejor momento para empezar'],
        ];
    } else if (h < 14) {
        pool = [
            ['Buen mediodía',  'Ya llegaste a la mitad del día — ¿cómo vas?'],
            ['Buen mediodía',  'Pausa, respira — ya vas a la mitad'],
            ['Buen mediodía',  'Momento perfecto para revisar tu progreso'],
            ['Buen mediodía',  'La jornada avanza — ¿cómo están tus tareas?'],
            ['Buen mediodía',  'Mitad del día, mitad del camino'],
        ];
    } else if (h < 19) {
        pool = [
            ['Buenas tardes',  '¿Cómo va el día? Tus datos te esperan abajo'],
            ['Buenas tardes',  'La tarde avanza — sigue así, vas bien'],
            ['Buenas tardes',  'Quedan pocas horas — úsalas bien'],
            ['Buenas tardes',  'El día no se acaba hasta que tú lo decides'],
            ['Buenas tardes',  'Tarde productiva por delante — a terminar fuerte'],
            ['Buenas tardes',  'Ya casi terminas el día, ánimo'],
            ['Buenas tardes',  'La tarde es un regalo extra del día'],
        ];
    } else {
        pool = [
            ['Buenas noches',  'Aquí tienes tu resumen del día'],
            ['Buenas noches',  'Terminando el día — revisa cómo te fue'],
            ['Buenas noches',  'Último repaso antes de cerrar el día'],
            ['Buenas noches',  'Ya casi — el día fue tuyo'],
            ['Buenas noches',  'Descansa pronto, mañana hay más por hacer'],
            ['Buenas noches',  'Noche de revisión — ¿cómo estuvo el día?'],
            ['Buenas noches',  'El día fue largo — pero lo lograste'],
        ];
    }

    var pick = pool[Math.floor(Math.random() * pool.length)];
    if (wordEl) wordEl.textContent = pick[0];
    if (subEl)  subEl.textContent  = pick[1];
})();

var dashBellBtn      = document.getElementById('dashBellBtn');
var dashBellDropdown = document.getElementById('dashNotifDropdown');
var dashBellOpen = false;
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
