<?php
// eventos de prueba por ahora
$events = [
    ['day' =>  6, 'title' => 'Quiz Química',          'color' => '#f87171', 'time' => '08:30'],
    ['day' => 10, 'title' => 'Entrega Lab. Física',   'color' => '#34d399', 'time' => '09:00'],
    ['day' => 14, 'title' => 'Tarea Estadística',     'color' => '#fbbf24', 'time' => '23:59'],
    ['day' => 18, 'title' => 'Parcial Cálculo II',    'color' => '#f472b6', 'time' => '11:00'],
    ['day' => 25, 'title' => 'Entrega Prog. Web',     'color' => '#60a5fa', 'time' => '18:00'],
    ['day' => 28, 'title' => 'Exposición Historia',   'color' => '#a78bfa', 'time' => '10:00'],
];

// indexar por dia para el grid
$eventsByDay = [];
foreach ($events as $ev) {
    $eventsByDay[$ev['day']][] = $ev;
}

// marzo 2026 empieza en domingo, offset 6 (lunes primero)
$calDays  = array_merge(array_fill(0, 6, null), range(1, 31));
$weekDays = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
$today    = 6;
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
        <span class="topbar-title">Calendario Académico</span>
        <div class="view-toggle">
            <button class="view-btn active">Mensual</button>
            <button class="view-btn">Agenda</button>
        </div>
        <div class="month-nav">
            <button id="prev-month"><i data-lucide="chevron-left"></i></button>
            <span id="month-label">Marzo 2026</span>
            <button id="next-month"><i data-lucide="chevron-right"></i></button>
        </div>
        <button class="btn-add"><i data-lucide="plus"></i> Nuevo evento</button>
    </div>
    <div class="calendar-wrap">
        <!-- cabecera dias de la semana -->
        <div class="cal-grid">
            <?php foreach ($weekDays as $d): ?>
            <div class="cal-header-day"><?= $d ?></div>
            <?php endforeach; ?>

            <?php foreach ($calDays as $d): ?>
            <div class="cal-cell">
                <?php if ($d): ?>
                <div class="cal-day-num<?= $d === $today ? ' today' : '' ?>"><?= $d ?></div>
                <?php if (isset($eventsByDay[$d])): ?>
                    <?php foreach (array_slice($eventsByDay[$d], 0, 2) as $ev): ?>
                    <div class="cal-event" style="background:<?= $ev['color'] ?>22; color:<?= $ev['color'] ?>;" title="<?= $ev['title'] ?> · <?= $ev['time'] ?>">
                        <?= $ev['title'] ?>
                    </div>
                    <?php endforeach; ?>
                    <?php if (count($eventsByDay[$d]) > 2): ?>
                    <div class="cal-more">+<?= count($eventsByDay[$d]) - 2 ?> más</div>
                    <?php endif; ?>
                <?php endif; ?>
                <?php endif; ?>
            </div>
            <?php endforeach; ?>
        </div>
    </div>
</div>

<script>
lucide.createIcons();
</script>
</body>
</html>
