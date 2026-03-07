<?php
// eventos de prueba por ahora
$events = [
    ['day' => 10, 'title' => 'Entrega Lab. Física',   'color' => '#34d399', 'time' => '09:00'],
    ['day' => 18, 'title' => 'Parcial Cálculo II',    'color' => '#f472b6', 'time' => '11:00'],
    ['day' => 25, 'title' => 'Entrega Prog. Web',     'color' => '#60a5fa', 'time' => '18:00'],
];
?>
<!DOCTYPE html>
<html lang="es-mx">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Calendario — NOOTRA</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="../css/calendar/calendar.css">
</head>
<body>

<aside class="sidebar">
    <div class="sidebar-logo">
        <div class="logo-icon">N</div>
        <span class="logo-text">NOOTRA</span>
    </div>
    <nav class="sidebar-nav">
        <a class="nav-item active" href="calendar.php"><i class="fa-solid fa-calendar-days"></i> Calendario</a>
        <a class="nav-item" href="#"><i class="fa-solid fa-house"></i> Dashboard</a>
        <a class="nav-item" href="#"><i class="fa-solid fa-book"></i> Cuadernos</a>
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
            <button id="prev-month"><i class="fa-solid fa-chevron-left"></i></button>
            <span id="month-label">Marzo 2026</span>
            <button id="next-month"><i class="fa-solid fa-chevron-right"></i></button>
        </div>
        <button class="btn-add"><i class="fa-solid fa-plus"></i> Nuevo evento</button>
    </div>
    <p>aqui va el grid</p>
</div>

</body>
</html>
