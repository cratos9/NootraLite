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
    <!-- solo mobile -->
    <div class="topbar-mobile">
        <button class="btn-hamburger-m" aria-label="Menú"><i data-lucide="menu"></i></button>
        <span class="topbar-title-m">Calendario</span>
        <button class="btn-add-m" aria-label="Nuevo evento"><i data-lucide="plus"></i></button>
    </div>

    <div class="view-chips">
        <button class="view-chip active">Mensual</button>
        <button class="view-chip">Semana</button>
        <button class="view-chip">Agenda</button>
    </div>

    <div class="mobile-cal-panel">
        <div class="mini-cal">
            <div class="mini-cal-nav">
                <button class="mini-prev"><i data-lucide="chevron-left"></i></button>
                <span class="mini-month-label">Marzo 2026</span>
                <button class="mini-next"><i data-lucide="chevron-right"></i></button>
            </div>
            <div class="mini-cal-grid" id="mini-cal-grid"></div>
        </div>
        <div class="mobile-event-list" id="mobile-event-list"></div>
    </div>

    <nav class="bottom-nav">
        <a class="bottom-nav-item" href="#"><i data-lucide="house"></i><span>Inicio</span></a>
        <a class="bottom-nav-item active" href="calendar.php"><i data-lucide="calendar-days"></i><span>Calendario</span></a>
        <a class="bottom-nav-item" href="#"><i data-lucide="check-square"></i><span>Tareas</span></a>
        <a class="bottom-nav-item" href="#"><i data-lucide="book-open"></i><span>Cuadernos</span></a>
    </nav>

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

function renderMiniCal(month, year) {
    var grid = document.getElementById('mini-cal-grid');
    if (!grid) return;
    grid.innerHTML = '';

    var days = ['L','M','M','J','V','S','D'];
    for (var i = 0; i < days.length; i++) {
        var h = document.createElement('div');
        h.className = 'mini-day-header';
        h.textContent = days[i];
        grid.appendChild(h);
    }

    var firstDay = new Date(year, month, 1).getDay();
    var offset = firstDay === 0 ? 6 : firstDay - 1;
    var totalDays = new Date(year, month + 1, 0).getDate();

    var monthEvs = {};
    for (var e = 0; e < events.length; e++) {
        var ev = events[e];
        if (ev.month === month && ev.year === year) {
            if (!monthEvs[ev.day]) monthEvs[ev.day] = [];
            monthEvs[ev.day].push(ev);
        }
    }

    var hoy = new Date();
    var esHoy = hoy.getMonth() === month && hoy.getFullYear() === year;

    for (var o = 0; o < offset; o++) {
        grid.appendChild(document.createElement('div'));
    }

    for (var d = 1; d <= totalDays; d++) {
        var cell = document.createElement('div');
        cell.className = 'mini-day-cell';
        cell.dataset.day = d;

        var num = document.createElement('div');
        num.className = 'mini-day-num' + (esHoy && d === hoy.getDate() ? ' today' : '');
        num.textContent = d;
        cell.appendChild(num);

        if (monthEvs[d]) {
            var dots = document.createElement('div');
            dots.className = 'mini-dots';
            var max = Math.min(monthEvs[d].length, 3);
            for (var x = 0; x < max; x++) {
                var dot = document.createElement('span');
                dot.className = 'mini-dot';
                dot.style.background = monthEvs[d][x].color;
                dots.appendChild(dot);
            }
            cell.appendChild(dots);
        }

        cell.addEventListener('click', function() {
            renderMobileEventList(parseInt(this.dataset.day), calState.month, calState.year);
        });

        grid.appendChild(cell);
    }

    document.querySelector('.mini-month-label').textContent = meses[month] + ' ' + year;
}

function renderMobileEventList(day, month, year) {
    var list = document.getElementById('mobile-event-list');
    if (!list) return;
    list.innerHTML = '';

    var filtered = events.filter(function(ev) {
        if (ev.month !== month || ev.year !== year) return false;
        return day === null || ev.day === day;
    });

    if (filtered.length === 0) {
        var empty = document.createElement('p');
        empty.style.cssText = 'color:var(--text-muted);font-size:12px;padding:12px 0;text-align:center';
        empty.textContent = 'Sin eventos';
        list.appendChild(empty);
        return;
    }

    for (var i = 0; i < filtered.length; i++) {
        var ev = filtered[i];
        var card = document.createElement('div');
        card.className = 'mobile-ev-card';

        var bar = document.createElement('div');
        bar.className = 'mobile-ev-bar';
        bar.style.background = ev.color;

        var info = document.createElement('div');
        info.className = 'mobile-ev-info';
        info.innerHTML = '<span class="mobile-ev-title">' + ev.title + '</span>'
            + '<span class="mobile-ev-time">' + ev.time + '</span>';

        card.appendChild(bar);
        card.appendChild(info);
        list.appendChild(card);
    }
}

document.querySelectorAll('.view-chip').forEach(function(chip) {
    chip.addEventListener('click', function() {
        document.querySelectorAll('.view-chip').forEach(function(c) { c.classList.remove('active'); });
        this.classList.add('active');
    });
});

document.querySelector('.mini-prev').addEventListener('click', function() {
    calState.month--;
    if (calState.month < 0) { calState.month = 11; calState.year--; }
    renderCalendar(calState.month, calState.year);
    renderMiniCal(calState.month, calState.year);
    renderMobileEventList(null, calState.month, calState.year);
});

document.querySelector('.mini-next').addEventListener('click', function() {
    calState.month++;
    if (calState.month > 11) { calState.month = 0; calState.year++; }
    renderCalendar(calState.month, calState.year);
    renderMiniCal(calState.month, calState.year);
    renderMobileEventList(null, calState.month, calState.year);
});

renderCalendar(calState.month, calState.year);
renderMiniCal(calState.month, calState.year);
renderMobileEventList(null, calState.month, calState.year);
lucide.createIcons();
</script>
</body>
</html>
