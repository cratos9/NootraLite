<!DOCTYPE html>
<html lang="es-mx">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" type="image/png" href="/assets/favicon.png">
    <title>Calendario — NOOTRA</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
    <link rel="stylesheet" href="../css/includes/sidebar.css">
    <link rel="stylesheet" href="../css/calendar/calendar.css">
</head>
<body>
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
            <button class="btn-today">Hoy</button>
            <button class="btn-add">
                <i data-lucide="plus"></i>
                <span class="btn-label-full">Agregar evento</span>
                <span class="btn-label-short">Evento</span>
            </button>
            <button class="btn-theme" id="btn-theme-desk"><i data-lucide="sun" class="icon-sun"></i><i data-lucide="moon" class="icon-moon"></i></button>
        </div>
    </div>
    <!-- solo mobile -->
    <div class="topbar-mobile">
        <span class="topbar-title-m">Calendario</span>
        <div style="display:flex;align-items:center;gap:4px">
            <button class="btn-theme" id="btn-theme-m"><i data-lucide="sun" class="icon-sun"></i><i data-lucide="moon" class="icon-moon"></i></button>
            <button class="btn-add-m" aria-label="Nuevo evento"><i data-lucide="plus"></i></button>
        </div>
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

    <!-- modal nuevo evento -->
    <div class="modal-overlay" id="modal-overlay">
        <div class="modal-box" id="modal-box">
            <div class="modal-header">
                <span class="modal-title">Nuevo evento</span>
                <button class="modal-close" id="modal-close"><i data-lucide="x"></i></button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>Título</label>
                    <input type="text" class="form-input" id="ev-title" placeholder="Ej. Parcial de Cálculo">
                    <span class="form-error" id="ev-title-error" style="display:none;font-size:11px;color:#ef4444;margin-top:2px"></span>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Fecha</label>
                        <input type="date" class="form-input" id="ev-date">
                    </div>
                    <div class="form-group">
                        <label>Hora</label>
                        <input type="time" class="form-input" id="ev-time">
                    </div>
                </div>
                <div class="form-group">
                    <label>Todo el día</label>
                    <input type="checkbox" id="ev-allday" style="margin-left:6px;cursor:pointer">
                </div>
                <div class="form-group">
                    <label>Color</label>
                    <div class="color-swatches">
                        <span class="swatch active" data-color="#7c3aed" style="background:#7c3aed"></span>
                        <span class="swatch" data-color="#ec4899" style="background:#ec4899"></span>
                        <span class="swatch" data-color="#10b981" style="background:#10b981"></span>
                        <span class="swatch" data-color="#f59e0b" style="background:#f59e0b"></span>
                        <span class="swatch" data-color="#3b82f6" style="background:#3b82f6"></span>
                        <span class="swatch" data-color="#ef4444" style="background:#ef4444"></span>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-cancel" id="modal-cancel">Cancelar</button>
                <button class="btn-save">Guardar</button>
            </div>
        </div>
    </div>

    <!-- panel full-screen móvil nuevo/editar evento -->
    <div class="mobile-form-panel" id="mobile-form-panel">
        <div class="mfp-header">
            <button class="mfp-back" id="mfp-back"><i data-lucide="arrow-left"></i></button>
            <span class="mfp-title" id="mfp-title">Nuevo evento</span>
        </div>
        <div class="mfp-body">
            <div class="form-group">
                <label>Título</label>
                <input type="text" class="form-input" id="mev-title" placeholder="Ej. Parcial de Cálculo">
                <span class="form-error" id="mev-title-error" style="display:none;font-size:11px;color:#ef4444;margin-top:2px"></span>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Fecha</label>
                    <input type="date" class="form-input" id="mev-date">
                </div>
                <div class="form-group">
                    <label>Hora</label>
                    <input type="time" class="form-input" id="mev-time">
                </div>
            </div>
            <div class="form-group" style="flex-direction:row;align-items:center;gap:8px">
                <label style="margin:0">Todo el día</label>
                <input type="checkbox" id="mev-allday" style="cursor:pointer">
            </div>
            <div class="form-group">
                <label>Color</label>
                <div class="color-swatches" id="mev-swatches">
                    <span class="swatch active" data-color="#7c3aed" style="background:#7c3aed"></span>
                    <span class="swatch" data-color="#ec4899" style="background:#ec4899"></span>
                    <span class="swatch" data-color="#10b981" style="background:#10b981"></span>
                    <span class="swatch" data-color="#f59e0b" style="background:#f59e0b"></span>
                    <span class="swatch" data-color="#3b82f6" style="background:#3b82f6"></span>
                    <span class="swatch" data-color="#ef4444" style="background:#ef4444"></span>
                </div>
            </div>
        </div>
        <div class="mfp-footer">
            <button class="btn-save mfp-save" id="mfp-save">Guardar</button>
        </div>
    </div>

    <!-- bottom sheet detalle evento móvil -->
    <div class="mev-sheet-overlay" id="mev-sheet-overlay">
        <div class="mev-sheet">
            <div class="mev-sheet-handle"></div>
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
                <div class="mev-sheet-dot" id="mev-sheet-dot"></div>
                <span class="mev-sheet-title" id="mev-sheet-title"></span>
            </div>
            <div class="mev-sheet-meta"><i data-lucide="clock" style="width:13px;height:13px"></i><span id="mev-sheet-time"></span></div>
            <div class="mev-sheet-meta"><i data-lucide="calendar" style="width:13px;height:13px"></i><span id="mev-sheet-date"></span></div>
            <div class="mev-sheet-actions">
                <button class="mev-sheet-btn mev-btn-edit" id="mev-sheet-edit"><i data-lucide="pencil"></i><span>Editar</span></button>
                <button class="mev-sheet-btn mev-btn-delete" id="mev-sheet-delete"><i data-lucide="trash-2"></i><span>Eliminar</span></button>
            </div>
        </div>
    </div>

    <!-- overlay detalle del dia -->
    <div class="day-detail-overlay" id="day-detail-overlay">
        <div class="day-detail-box">
            <div class="day-detail-header">
                <span class="day-detail-title" id="day-detail-title"></span>
                <button class="day-detail-close" id="day-detail-close"><i data-lucide="x"></i></button>
            </div>
            <div class="day-detail-list" id="day-detail-list"></div>
            <div class="day-detail-footer">
                <button class="btn-add-from-detail" id="btn-add-from-detail"><i data-lucide="plus" style="width:14px;height:14px"></i> Agregar evento</button>
            </div>
        </div>
    </div>

    <div class="agenda-wrap" id="agenda-wrap" style="display:none">
        <h3 class="agenda-title" id="agenda-title"></h3>
        <div id="agenda-list"></div>
    </div>

    <div class="week-wrap" id="week-wrap" style="display:none">
        <div class="week-header" id="week-header"></div>
        <div class="week-grid" id="week-grid"></div>
    </div>

    <div class="calendar-layout">
        <div class="calendar-wrap">
            <div class="cal-grid">
                <?php foreach ($weekDays as $d): ?>
                <div class="cal-header-day"><?= $d ?></div>
                <?php endforeach; ?>
                <!-- las celdas las genera JS -->
            </div>
        </div>
        <aside class="upcoming-panel" id="upcoming-panel">
            <h3 class="upcoming-title">Próximos eventos</h3>
            <div class="upcoming-sections" id="upcoming-sections">
                <!-- JS va a popular esto en sesión 2 -->
            </div>
        </aside>
    </div>
</div>

<script>var events = <?= json_encode(array_values($events)) ?>;</script>
<script src="../js/includes/sidebar.js"></script>
<script src="../js/calendar/calendar.js"></script>
</body>
</html>
