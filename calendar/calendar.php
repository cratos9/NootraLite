<?php
require_once '../includes/db.php';

// por ahora user_id fijo hasta que haya sesion
$uid  = 1;
$stmt = $pdo->prepare("SELECT title, color, start_datetime, all_day FROM tasks WHERE user_id = ? ORDER BY start_datetime");
$stmt->execute([$uid]);
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

$events = [];
foreach ($rows as $r) {
    $dt = new DateTime($r['start_datetime']);
    $events[] = [
        'title' => $r['title'],
        'color' => $r['color'] ?: '#7c3aed',
        'day'   => (int)$dt->format('j'),
        'month' => (int)$dt->format('n') - 1, // 0-indexed igual que JS
        'year'  => (int)$dt->format('Y'),
        'time'  => $r['all_day'] ? 'Todo el día' : $dt->format('H:i'),
    ];
}

$weekDays = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
?>
<!DOCTYPE html>
<html lang="es-mx">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Calendario — NOOTRA</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
    <link rel="stylesheet" href="../css/calendar/calendar.css">
</head>
<body>

<aside class="sidebar">
    <div class="sidebar-logo">
        <div class="logo-icon">N</div>
        <span class="logo-text">NOOTRA</span>
    </div>
    <nav class="sidebar-nav">
        <a class="nav-item" href="#"><i data-lucide="house"></i> Dashboard</a>
        <a class="nav-item active" href="calendar.php"><i data-lucide="calendar-days"></i> Calendario</a>
        <a class="nav-item" href="#"><i data-lucide="book-open"></i> Cuadernos</a>
    </nav>
</aside>

<div class="main">
    <div class="topbar">
        <div class="topbar-left">
            <div class="logo-icon tb-logo">N</div>
            <span class="logo-text tb-logotext">NOOTRA</span>
            <span class="topbar-title">Calendario Académico</span>
            <div class="view-toggle" id="view-toggle-desk">
                <button class="view-btn active">Mensual</button>
                <button class="view-btn">Semana</button>
                <button class="view-btn">Agenda</button>
            </div>
        </div>
        <div class="topbar-right">
            <div class="month-nav">
                <button id="prev-month"><i data-lucide="chevron-left"></i></button>
                <span id="month-label">Marzo 2026</span>
                <button id="next-month"><i data-lucide="chevron-right"></i></button>
            </div>
            <div class="view-toggle view-toggle-tab">
                <button class="view-btn active">Mes</button>
                <button class="view-btn">Sem.</button>
            </div>
            <button class="btn-today">Hoy</button>
            <button class="btn-add">
                <i data-lucide="plus"></i>
                <span class="btn-label-full">Agregar evento</span>
                <span class="btn-label-short">Evento</span>
            </button>
            <button class="btn-hamburger" aria-label="Menú"><i data-lucide="menu"></i></button>
        </div>
    </div>
    <div class="calendar-wrap">
        <div class="cal-grid">
            <?php foreach ($weekDays as $d): ?>
            <div class="cal-header-day"><?= $d ?></div>
            <?php endforeach; ?>
            <!-- las celdas las genera JS -->
        </div>
    </div>
</div>

<script>
var events = <?= json_encode(array_values($events)) ?>;

var meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

var calState = { month: 2, year: 2026 };

function renderCalendar(month, year) {
    // primer dia del mes
    var firstDay = new Date(year, month, 1).getDay();
    // convertir a lunes=0 ... domingo=6
    var offset = (firstDay === 0) ? 6 : firstDay - 1;

    var totalDays = new Date(year, month + 1, 0).getDate();

    // filtrar eventos del mes/año actual
    var monthEvents = {};
    for (var i = 0; i < events.length; i++) {
        var ev = events[i];
        if (ev.month === month && ev.year === year) {
            if (!monthEvents[ev.day]) monthEvents[ev.day] = [];
            monthEvents[ev.day].push(ev);
        }
    }

    // actualizar label
    document.getElementById('month-label').textContent = meses[month] + ' ' + year;

    // borrar celdas actuales (mantener los 7 headers)
    var grid = document.querySelector('.cal-grid');
    var cells = grid.querySelectorAll('.cal-cell');
    for (var c = 0; c < cells.length; c++) {
        cells[c].remove();
    }

    var hoy = new Date();
    var esHoy = (hoy.getMonth() === month && hoy.getFullYear() === year);
    var diaHoy = hoy.getDate();

    // celdas vacias del offset
    for (var o = 0; o < offset; o++) {
        var empty = document.createElement('div');
        empty.className = 'cal-cell';
        grid.appendChild(empty);
    }

    // dias del mes
    for (var d = 1; d <= totalDays; d++) {
        var cell = document.createElement('div');
        cell.className = 'cal-cell';

        var numEl = document.createElement('div');
        numEl.className = 'cal-day-num' + (esHoy && d === diaHoy ? ' today' : '');
        numEl.textContent = d;
        cell.appendChild(numEl);

        // eventos del dia
        if (monthEvents[d]) {
            var evList = monthEvents[d];
            var max = Math.min(evList.length, 2);
            for (var e = 0; e < max; e++) {
                var evEl = document.createElement('div');
                evEl.className = 'cal-event';
                evEl.style.background = evList[e].color + '22';
                evEl.style.color = evList[e].color;
                evEl.dataset.title = evList[e].title;
                evEl.dataset.time  = evList[e].time;
                evEl.dataset.color = evList[e].color;
                evEl.dataset.day   = d;
                evEl.textContent = evList[e].title;
                cell.appendChild(evEl);
            }
            if (evList.length > 2) {
                var more = document.createElement('div');
                more.className = 'cal-more';
                more.textContent = '+' + (evList.length - 2) + ' más';
                cell.appendChild(more);
            }
        }

        grid.appendChild(cell);
    }
}

document.getElementById('prev-month').addEventListener('click', function() {
    calState.month--;
    if (calState.month < 0) {
        calState.month = 11;
        calState.year--;
    }
    renderCalendar(calState.month, calState.year);
});

document.getElementById('next-month').addEventListener('click', function() {
    calState.month++;
    if (calState.month > 11) {
        calState.month = 0;
        calState.year++;
    }
    renderCalendar(calState.month, calState.year);
});

// popup de ver evento
var popup = document.createElement('div');
popup.className = 'ev-popup';
popup.innerHTML = '<div class="ev-popup-header">'
    + '<div class="ev-popup-dot" id="pop-dot"></div>'
    + '<span class="ev-popup-title" id="pop-title"></span>'
    + '<button class="ev-popup-close" id="pop-close"><i data-lucide="x"></i></button>'
    + '</div>'
    + '<div class="ev-popup-meta"><i data-lucide="clock" style="width:12px;height:12px"></i><span id="pop-time"></span></div>'
    + '<div class="ev-popup-meta" style="margin-top:2px"><i data-lucide="calendar" style="width:12px;height:12px"></i><span id="pop-date"></span></div>';
document.body.appendChild(popup);

document.getElementById('pop-close').addEventListener('click', function() {
    popup.classList.remove('show');
});

document.addEventListener('click', function(e) {
    if (e.target.closest('.cal-event')) {
        var el = e.target.closest('.cal-event');
        document.getElementById('pop-dot').style.background   = el.dataset.color;
        document.getElementById('pop-title').textContent = el.dataset.title;
        document.getElementById('pop-time').textContent  = el.dataset.time;
        document.getElementById('pop-date').textContent  = el.dataset.day + ' de ' + meses[calState.month] + ' ' + calState.year;
        var rect = el.getBoundingClientRect();
        popup.style.top  = (rect.bottom + 6 + window.scrollY) + 'px';
        popup.style.left = Math.min(rect.left, window.innerWidth - 280) + 'px';
        popup.classList.add('show');
        lucide.createIcons();
    } else if (!e.target.closest('.ev-popup')) {
        popup.classList.remove('show');
    }
});

renderCalendar(calState.month, calState.year);
lucide.createIcons();
</script>
</body>
</html>
