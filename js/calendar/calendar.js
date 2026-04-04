// toggle tema
function toggleTheme() {
    document.body.classList.toggle('light-mode');
    var isLight = document.body.classList.contains('light-mode');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
}

document.getElementById('btn-theme-desk').addEventListener('click', toggleTheme);
document.getElementById('btn-theme-m').addEventListener('click', toggleTheme);

var meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

function getUrgency(ev) {
    var now = new Date();
    var evDate = ev.all_day
        ? new Date(ev.year, ev.month, ev.day, 23, 59)
        : new Date(ev.start_datetime);
    var diff = evDate - now;
    if (diff < 0) return 'past';
    if (diff < 86400000) return 'soon';
    return 'future';
}

var calState = { month: new Date().getMonth(), year: new Date().getFullYear() };
var currentView = 'month';
var weekStart = null;
var navDirection = 'next';

function updateTodayBtn() {
    var hoy = new Date();
    var btn = document.querySelector('.btn-today');
    if (!btn) return;
    if (calState.month !== hoy.getMonth() || calState.year !== hoy.getFullYear()) {
        btn.classList.add('away');
    } else {
        btn.classList.remove('away');
    }
}

function getMonday(date) {
    var d = new Date(date);
    var day = d.getDay();
    var diff = (day === 0) ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
}

function renderCalendar(month, year) {
    var firstDay = new Date(year, month, 1).getDay();
    var offset = (firstDay === 0) ? 6 : firstDay - 1;
    var totalDays = new Date(year, month + 1, 0).getDate();

    var monthEvents = {};
    for (var i = 0; i < events.length; i++) {
        var ev = events[i];
        if (ev.month === month && ev.year === year) {
            if (!monthEvents[ev.day]) monthEvents[ev.day] = [];
            monthEvents[ev.day].push(ev);
        }
    }

    document.getElementById('month-label').textContent = meses[month] + ' ' + year;

    var grid = document.querySelector('.cal-grid');
    grid.classList.remove('month-fade-prev', 'month-fade-next');
    grid.offsetHeight;
    grid.classList.add('month-fade-' + navDirection);

    var cells = grid.querySelectorAll('.cal-cell');
    for (var c = 0; c < cells.length; c++) {
        cells[c].remove();
    }

    var hoy = new Date();
    var esHoy = (hoy.getMonth() === month && hoy.getFullYear() === year);
    var diaHoy = hoy.getDate();

    for (var o = 0; o < offset; o++) {
        var empty = document.createElement('div');
        empty.className = 'cal-cell offset-cell';
        grid.appendChild(empty);
    }

    for (var d = 1; d <= totalDays; d++) {
        var cell = document.createElement('div');
        var isPast = esHoy && d < diaHoy;
        cell.className = 'cal-cell' + (isPast ? ' past-day' : '');

        var numEl = document.createElement('div');
        numEl.className = 'cal-day-num' + (esHoy && d === diaHoy ? ' today' : '');
        numEl.textContent = d;
        cell.appendChild(numEl);

        if (monthEvents[d]) {
            var evList = monthEvents[d];
            var max = Math.min(evList.length, 2);
            for (var e = 0; e < max; e++) {
                var evEl = document.createElement('div');
                evEl.className = 'cal-event ev-' + getUrgency(evList[e]);
                evEl.style.background = evList[e].color + '22';
                evEl.style.color = evList[e].color;
                evEl.dataset.id    = evList[e].id;
                evEl.dataset.title = evList[e].title;
                evEl.dataset.time  = evList[e].time;
                evEl.dataset.color = evList[e].color;
                evEl.dataset.day   = d;
                evEl.textContent = evList[e].title;
                var urgDot = document.createElement('span');
                urgDot.className = 'ev-urgency-dot';
                evEl.appendChild(urgDot);
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

// modal
var modalOverlay = document.getElementById('modal-overlay');

function openModal(dateStr) {
    if (!dateStr) {
        var hoy = new Date();
        var mm = String(hoy.getMonth() + 1).padStart(2, '0');
        var dd = String(hoy.getDate()).padStart(2, '0');
        dateStr = hoy.getFullYear() + '-' + mm + '-' + dd;
    }
    document.getElementById('ev-date').value = dateStr;
    modalOverlay.classList.add('show');
    lucide.createIcons();
}

function closeModal(cb) {
    var box = document.getElementById('modal-box');
    box.classList.add('closing');
    box.addEventListener('animationend', function handler() {
        box.removeEventListener('animationend', handler);
        modalOverlay.classList.remove('show');
        box.classList.remove('closing');
        editingEventId = null;
        document.querySelector('.modal-title').textContent = 'Nuevo evento';
        if (cb) cb();
    });
}

document.querySelector('.btn-add').addEventListener('click', openModal);
document.querySelector('.btn-add-m').addEventListener('click', function() { openMobileForm(null); });
document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('modal-cancel').addEventListener('click', closeModal);

modalOverlay.addEventListener('click', function(e) {
    if (e.target === modalOverlay) closeModal();
});

document.querySelectorAll('.swatch').forEach(function(sw) {
    sw.addEventListener('click', function() {
        document.querySelectorAll('.swatch').forEach(function(s) { s.classList.remove('active'); });
        this.classList.add('active');
    });
});

document.getElementById('ev-allday').addEventListener('change', function() {
    document.getElementById('ev-time').disabled = this.checked;
    document.getElementById('ev-time').style.opacity = this.checked ? '0.4' : '1';
});

document.querySelector('.btn-save').addEventListener('click', function() {
    var titleVal = document.getElementById('ev-title').value.trim();
    var dateVal  = document.getElementById('ev-date').value;
    var errEl    = document.getElementById('ev-title-error');

    errEl.style.display = 'none';

    if (!titleVal) {
        errEl.textContent = 'El título es obligatorio';
        showErr(errEl);
        return;
    }
    if (!dateVal) {
        errEl.textContent = 'La fecha es obligatoria';
        showErr(errEl);
        return;
    }

    var fd = new FormData();
    fd.append('title',   titleVal);
    fd.append('date',    dateVal);
    fd.append('time',    document.getElementById('ev-time').value);
    fd.append('color',   document.querySelector('.swatch.active').dataset.color);
    if (document.getElementById('ev-allday').checked) fd.append('all_day', '1');

    var url = 'save_event.php';
    if (editingEventId) {
        fd.append('id', editingEventId);
        url = 'update_event.php';
    }

    var saveBtn = document.querySelector('.btn-save');
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<span class="save-spinner"></span>Guardando...';

    fetch(url, { method: 'POST', body: fd })
        .then(function(r) { return r.json(); })
        .then(function(data) {
            saveBtn.disabled = false;
            saveBtn.textContent = 'Guardar';
            if (!data.ok) {
                errEl.textContent = data.error;
                showErr(errEl);
                return;
            }
            if (editingEventId) {
                // actualizar en el array local
                for (var i = 0; i < events.length; i++) {
                    if (events[i].id === editingEventId) {
                        events[i] = data.event;
                        break;
                    }
                }
            } else {
                events.push(data.event);
            }
            var msg = editingEventId ? 'Evento actualizado' : 'Evento guardado';
            renderCalendar(calState.month, calState.year);
            renderMiniCal(calState.month, calState.year);
            if (currentView === 'agenda') renderAgenda(calState.month, calState.year);
            renderUpcoming();
            showToast(msg);
            closeModal(function() {
                document.getElementById('ev-title').value = '';
                document.getElementById('ev-time').value = '';
                document.getElementById('ev-allday').checked = false;
                document.getElementById('ev-time').disabled = false;
                document.getElementById('ev-time').style.opacity = '1';
                document.querySelectorAll('.swatch').forEach(function(s) { s.classList.remove('active'); });
                document.querySelector('.swatch[data-color="#7c3aed"]').classList.add('active');
            });
        })
        .catch(function() {
            saveBtn.disabled = false;
            saveBtn.textContent = 'Guardar';
            errEl.textContent = 'error al guardar, intenta de nuevo';
            showErr(errEl);
        });
});

document.addEventListener('keydown', function(e) {
    if (e.key !== 'Escape') return;
    if (modalOverlay.classList.contains('show')) { closeModal(); return; }
    if (popup.classList.contains('show')) { closePopup(); return; }
    var mevSheet = document.getElementById('mev-sheet-overlay');
    if (mevSheet && mevSheet.classList.contains('show')) { closeMevSheet(); return; }
    var mfp = document.getElementById('mobile-form-panel');
    if (mfp && mfp.classList.contains('open')) closeMobileForm();
});

document.querySelector('.btn-today').addEventListener('click', function() {
    var hoy = new Date();
    if (currentView === 'week') {
        weekStart = getMonday(hoy);
        renderWeek(weekStart);
        return;
    }
    calState.month = hoy.getMonth();
    calState.year = hoy.getFullYear();
    renderCalendar(calState.month, calState.year);
    if (currentView === 'agenda') renderAgenda(calState.month, calState.year);
    renderUpcoming();
});


document.getElementById('prev-month').addEventListener('click', function() {
    if (currentView === 'week') {
        if (!weekStart) weekStart = getMonday(new Date());
        weekStart.setDate(weekStart.getDate() - 7);
        renderWeek(weekStart);
        return;
    }
    navDirection = 'prev';
    calState.month--;
    if (calState.month < 0) {
        calState.month = 11;
        calState.year--;
    }
    renderCalendar(calState.month, calState.year);
    if (currentView === 'agenda') renderAgenda(calState.month, calState.year);
    renderUpcoming();
    updateTodayBtn();
});

document.getElementById('next-month').addEventListener('click', function() {
    if (currentView === 'week') {
        if (!weekStart) weekStart = getMonday(new Date());
        weekStart.setDate(weekStart.getDate() + 7);
        renderWeek(weekStart);
        return;
    }
    navDirection = 'next';
    calState.month++;
    if (calState.month > 11) {
        calState.month = 0;
        calState.year++;
    }
    renderCalendar(calState.month, calState.year);
    if (currentView === 'agenda') renderAgenda(calState.month, calState.year);
    renderUpcoming();
    updateTodayBtn();
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
    + '<div class="ev-popup-meta" style="margin-top:2px"><i data-lucide="calendar" style="width:12px;height:12px"></i><span id="pop-date"></span></div>'
    + '<div class="ev-popup-actions">'
    + '<button id="pop-edit" class="ev-popup-action-btn edit">Editar</button>'
    + '<button id="pop-delete" class="ev-popup-action-btn delete">Eliminar</button>'
    + '</div>';
document.body.appendChild(popup);

document.getElementById('pop-close').addEventListener('click', function() {
    closePopup();
});

document.getElementById('pop-edit').addEventListener('click', function() {
    var ev = events.find(function(e) { return e.id === currentEventId; });
    if (!ev) return;

    editingEventId = ev.id;
    document.querySelector('.modal-title').textContent = 'Editar evento';
    document.getElementById('ev-title').value = ev.title;
    // fecha: reconstruir de year/month/day
    var mm = String(ev.month + 1).padStart(2, '0');
    var dd = String(ev.day).padStart(2, '0');
    document.getElementById('ev-date').value = ev.year + '-' + mm + '-' + dd;
    document.getElementById('ev-time').value  = ev.time || '';

    document.querySelectorAll('.swatch').forEach(function(s) { s.classList.remove('active'); });
    var match = document.querySelector('.swatch[data-color="' + ev.color + '"]');
    if (match) match.classList.add('active');
    else document.querySelector('.swatch').classList.add('active');

    closePopup(function() {
        modalOverlay.classList.add('show');
        lucide.createIcons();
    });
});

var deleteTimer = null;
var currentEventId = null;
var editingEventId = null;

document.getElementById('pop-delete').addEventListener('click', function() {
    var btn = this;

    if (btn.textContent === 'Eliminar') {
        btn.textContent = '¿Confirmar?';
        btn.style.color = '#f59e0b';
        deleteTimer = setTimeout(function() {
            btn.textContent = 'Eliminar';
            btn.style.color = '#ef4444';
        }, 2000);
        return;
    }

    clearTimeout(deleteTimer);
    if (!currentEventId) return;

    fetch('delete_event.php', {
        method: 'POST',
        body: new URLSearchParams({ id: currentEventId })
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
        if (!data.ok) {
            btn.textContent = 'Eliminar';
            btn.style.color = '#ef4444';
            return;
        }
        var deletedId = currentEventId;
        events = events.filter(function(ev) { return ev.id !== deletedId; });
        currentEventId = null;
        showToast('Evento eliminado', 'danger');
        closePopup(function() {
            renderCalendar(calState.month, calState.year);
            renderMiniCal(calState.month, calState.year);
            if (currentView === 'agenda') renderAgenda(calState.month, calState.year);
            renderUpcoming();
        });
        return;
    })
    .catch(function() {
        btn.textContent = 'Eliminar';
        btn.style.color = '#ef4444';
    });
});

var activeCell = null;

function clearActiveCell() {
    if (activeCell) {
        activeCell.classList.remove('active-cell');
        activeCell = null;
    }
}

function closePopup(callback) {
    if (!popup.classList.contains('show')) return;
    popup.classList.add('closing');
    popup.addEventListener('animationend', function handler() {
        popup.classList.remove('show', 'closing');
        popup.removeEventListener('animationend', handler);
        clearActiveCell();
        if (callback) callback();
    });
}

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
        currentEventId = el.dataset.id ? parseInt(el.dataset.id) : null;
        var delBtn = document.getElementById('pop-delete');
        if (delBtn) { delBtn.textContent = 'Eliminar'; delBtn.style.color = '#ef4444'; }
        clearActiveCell();
        activeCell = el.closest('.cal-cell');
        if (activeCell) activeCell.classList.add('active-cell');
        lucide.createIcons();
    } else if (e.target.closest('.cal-more')) {
        var moreCell = e.target.closest('.cal-cell');
        var moreDayNum = moreCell ? moreCell.querySelector('.cal-day-num') : null;
        if (moreDayNum) {
            var md = parseInt(moreDayNum.textContent);
            var moreEvs = events.filter(function(ev) {
                return ev.day === md && ev.month === calState.month && ev.year === calState.year;
            });
            openDayDetail(md, moreEvs);
        }
    } else if (e.target.closest('.cal-cell') && !e.target.closest('.ev-popup')) {
        closePopup();
        var cell = e.target.closest('.cal-cell');
        var dayNum = cell.querySelector('.cal-day-num');
        if (dayNum) {
            var d = parseInt(dayNum.textContent);
            var dayEvents = events.filter(function(ev) {
                return ev.day === d && ev.month === calState.month && ev.year === calState.year;
            });
            if (dayEvents.length > 0) {
                openDayDetail(d, dayEvents);
            } else {
                var mm = String(calState.month + 1).padStart(2, '0');
                var dd = String(d).padStart(2, '0');
                openModal(calState.year + '-' + mm + '-' + dd);
            }
        }
    } else if (!e.target.closest('.ev-popup') && !e.target.closest('.day-detail-box') && !e.target.closest('.upcoming-event-card') && !e.target.closest('.agenda-item')) {
        closePopup();
    }
});

function showErr(el) {
    el.classList.remove('form-error');
    el.style.display = 'block';
    el.offsetHeight; // fuerza reflow para re-disparar animation
    el.classList.add('form-error');
}

function showToast(msg, type) {
    var icons = { success: 'check-circle', danger: 'trash-2', warning: 'alert-triangle' };
    var t = type || 'success';
    var existing = document.querySelectorAll('.cal-toast');
    var base = window.innerWidth <= 480 ? 80 : 24;
    var offset = base + existing.length * 50;
    var el = document.createElement('div');
    el.className = 'cal-toast cal-toast-' + t;
    el.style.bottom = offset + 'px';
    el.innerHTML = '<i data-lucide="' + (icons[t] || 'check-circle') + '" style="width:14px;height:14px;vertical-align:middle;margin-right:6px"></i>' + msg;
    document.body.appendChild(el);
    lucide.createIcons();
    setTimeout(function() {
        el.classList.add('hide');
        el.addEventListener('animationend', function() { el.remove(); });
    }, 2500);
}

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
            var maxd = Math.min(monthEvs[d].length, 3);
            for (var x = 0; x < maxd; x++) {
                var dot = document.createElement('span');
                dot.className = 'mini-dot';
                dot.style.background = monthEvs[d][x].color;
                dots.appendChild(dot);
            }
            cell.appendChild(dots);
        }

        cell.addEventListener('click', function() {
            document.querySelectorAll('.mini-day-num.selected').forEach(function(n) { n.classList.remove('selected'); });
            this.querySelector('.mini-day-num').classList.add('selected');
            var clickedDay = parseInt(this.dataset.day);
            var hasEvs = events.some(function(ev) {
                return ev.day === clickedDay && ev.month === calState.month && ev.year === calState.year;
            });
            renderMobileEventList(clickedDay, calState.month, calState.year);
            if (!hasEvs) {
                var mmd = String(calState.month + 1).padStart(2, '0');
                var mdd = String(clickedDay).padStart(2, '0');
                openMobileForm(null, calState.year + '-' + mmd + '-' + mdd);
            }
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
        var empty = document.createElement('div');
        empty.className = 'empty-state';
        empty.innerHTML = '<i data-lucide="calendar-x"></i><p>Sin eventos para hoy</p>';
        list.appendChild(empty);
        lucide.createIcons();
        return;
    }

    for (var i = 0; i < filtered.length; i++) {
        var ev = filtered[i];
        var card = document.createElement('div');
        card.className = 'mobile-ev-card ev-' + getUrgency(ev);

        var bar = document.createElement('div');
        bar.className = 'mobile-ev-bar';
        bar.style.background = ev.color;

        var info = document.createElement('div');
        info.className = 'mobile-ev-info';
        var titleSpan = document.createElement('span');
        titleSpan.className = 'mobile-ev-title';
        titleSpan.textContent = ev.title;

        var timeSpan = document.createElement('span');
        timeSpan.className = 'mobile-ev-time';
        timeSpan.textContent = ev.time;

        info.appendChild(titleSpan);
        info.appendChild(timeSpan);

        card.dataset.evId = ev.id;
        card.appendChild(bar);
        card.appendChild(info);
        card.addEventListener('click', function() {
            openMobileEventSheet(parseInt(this.dataset.evId));
        });
        list.appendChild(card);
    }
}

function renderAgenda(month, year) {
    var list = document.getElementById('agenda-list');
    if (!list) return;
    list.innerHTML = '';

    var filtered = [];
    for (var i = 0; i < events.length; i++) {
        if (events[i].month === month && events[i].year === year) filtered.push(events[i]);
    }
    filtered.sort(function(a, b) {
        if (a.day !== b.day) return a.day - b.day;
        return (a.time || '').localeCompare(b.time || '');
    });

    document.getElementById('agenda-title').textContent = 'Eventos — ' + meses[month] + ' ' + year + ' · ' + filtered.length + ' evento' + (filtered.length !== 1 ? 's' : '');

    if (filtered.length === 0) {
        var empty = document.createElement('div');
        empty.className = 'empty-state';
        empty.innerHTML = '<i data-lucide="calendar-x"></i><p>No hay eventos este mes</p>';
        list.appendChild(empty);
        lucide.createIcons();
        return;
    }

    var mesAbrev = meses[month].substring(0, 3).toUpperCase();
    var diasSem = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
    var lastDay = null;

    for (var j = 0; j < filtered.length; j++) {
        var ev = filtered[j];

        if (ev.day !== lastDay) {
            lastDay = ev.day;
            var dayLabel = document.createElement('div');
            dayLabel.className = 'agenda-day-label';
            var dName = diasSem[new Date(year, month, ev.day).getDay()];
            dayLabel.textContent = dName + ' ' + ev.day;
            list.appendChild(dayLabel);
        }

        var item = document.createElement('div');
        item.className = 'agenda-item ev-' + getUrgency(ev);
        item.style.animationDelay = (j * 0.04) + 's';

        var dateBlock = document.createElement('div');
        dateBlock.className = 'agenda-date';
        dateBlock.style.background = ev.color + '22';

        var abbr = document.createElement('span');
        abbr.className = 'agenda-month-abbr';
        abbr.style.color = ev.color;
        abbr.textContent = mesAbrev;

        var dayNum = document.createElement('span');
        dayNum.className = 'agenda-day-num';
        dayNum.style.color = ev.color;
        dayNum.textContent = ev.day;

        dateBlock.appendChild(abbr);
        dateBlock.appendChild(dayNum);

        var info = document.createElement('div');
        info.className = 'agenda-info';

        var titleEl = document.createElement('span');
        titleEl.className = 'agenda-ev-title';
        titleEl.textContent = ev.title;

        var metaEl = document.createElement('span');
        metaEl.className = 'agenda-ev-meta';
        metaEl.textContent = ev.time || 'Todo el día';

        info.appendChild(titleEl);
        info.appendChild(metaEl);

        var dot = document.createElement('div');
        dot.className = 'agenda-dot';
        dot.style.background = ev.color;

        item.appendChild(dateBlock);
        item.appendChild(info);
        item.appendChild(dot);

        item.addEventListener('click', (function(evData, itemEl) {
            return function() {
                if (window.innerWidth <= 480) {
                    openMobileEventSheet(evData.id);
                } else {
                    document.getElementById('pop-dot').style.background = evData.color;
                    document.getElementById('pop-title').textContent = evData.title;
                    document.getElementById('pop-time').textContent = evData.time || 'Todo el día';
                    document.getElementById('pop-date').textContent = evData.day + ' de ' + meses[evData.month] + ' ' + evData.year;
                    var rect = itemEl.getBoundingClientRect();
                    popup.style.top = (rect.bottom + 6 + window.scrollY) + 'px';
                    popup.style.left = Math.min(rect.left, window.innerWidth - 280) + 'px';
                    popup.classList.add('show');
                    currentEventId = evData.id;
                    var delBtn = document.getElementById('pop-delete');
                    if (delBtn) { delBtn.textContent = 'Eliminar'; delBtn.style.color = '#ef4444'; }
                    lucide.createIcons();
                }
            };
        })(ev, item));

        list.appendChild(item);
    }
}

var diasSemana = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
var mesesAbrev = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

function renderWeek(startDate) {
    var header = document.getElementById('week-header');
    var grid = document.getElementById('week-grid');
    if (!header || !grid) return;

    header.innerHTML = '';
    grid.innerHTML = '';

    var hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    var endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);

    // label del rango en el topbar
    var label = document.getElementById('month-label');
    if (label) {
        var desde = startDate.getDate();
        var hasta = endDate.getDate();
        var mesDesde = mesesAbrev[startDate.getMonth()];
        var mesHasta = mesesAbrev[endDate.getMonth()];
        if (startDate.getMonth() === endDate.getMonth()) {
            label.textContent = desde + ' - ' + hasta + ' ' + mesDesde + ' ' + startDate.getFullYear();
        } else {
            label.textContent = desde + ' ' + mesDesde + ' - ' + hasta + ' ' + mesHasta + ' ' + endDate.getFullYear();
        }
    }

    // actualizar calState con el jueves de la semana (referencia ISO)
    var jueves = new Date(startDate);
    jueves.setDate(jueves.getDate() + 3);
    calState.month = jueves.getMonth();
    calState.year = jueves.getFullYear();

    for (var d = 0; d < 7; d++) {
        var curr = new Date(startDate);
        curr.setDate(curr.getDate() + d);
        var isToday = curr.getTime() === hoy.getTime();

        // header cell
        var hCell = document.createElement('div');
        hCell.className = 'week-header-day' + (isToday ? ' today' : '');
        var nameSpan = document.createElement('span');
        nameSpan.textContent = diasSemana[(curr.getDay())];
        var numSpan = document.createElement('span');
        numSpan.className = 'week-day-num';
        numSpan.textContent = curr.getDate();
        hCell.appendChild(nameSpan);
        hCell.appendChild(numSpan);
        header.appendChild(hCell);

        // columna del dia
        var col = document.createElement('div');
        var colClass = 'week-day-col';
        if (isToday) colClass += ' week-today';
        var wd = curr.getDay();
        if (wd === 0 || wd === 6) colClass += ' week-weekend';
        col.className = colClass;

        // label visible en mobile
        var mLabel = document.createElement('span');
        mLabel.className = 'week-day-label';
        mLabel.textContent = diasSemana[curr.getDay()] + ' ' + curr.getDate();
        col.appendChild(mLabel);

        // filtrar y ordenar eventos del dia
        var dayEvents = events.filter(function(ev) {
            return ev.day === curr.getDate() && ev.month === curr.getMonth() && ev.year === curr.getFullYear();
        }).sort(function(a, b) {
            return (a.time || '').localeCompare(b.time || '');
        });

        if (dayEvents.length === 0) {
            var noEv = document.createElement('span');
            noEv.className = window.innerWidth <= 480 ? 'week-empty-mobile' : 'week-empty-col';
            noEv.textContent = window.innerWidth <= 480 ? '—' : 'Sin eventos';
            col.appendChild(noEv);
        }

        for (var e = 0; e < dayEvents.length; e++) {
            (function(ev, idx) {
                var card = document.createElement('div');
                card.className = 'week-event ev-' + getUrgency(ev);
                card.style.animationDelay = (idx * 0.04) + 's';
                card.style.background = ev.color + '33';
                card.style.borderLeft = '3px solid ' + ev.color;

                var titleEl = document.createElement('span');
                titleEl.textContent = ev.title;
                card.appendChild(titleEl);

                if (ev.time && !ev.all_day) {
                    var timeEl = document.createElement('span');
                    timeEl.className = 'week-event-time';
                    timeEl.textContent = ev.time;
                    card.appendChild(timeEl);
                }

                card.addEventListener('click', function() {
                    if (window.innerWidth <= 480) {
                        openMobileEventSheet(ev.id);
                    } else {
                        var rect = card.getBoundingClientRect();
                        currentEventId = ev.id;
                        if (!popup) return;
                        popup.querySelector('#pop-title').textContent = ev.title;
                        popup.querySelector('#pop-time').textContent = ev.all_day ? 'Todo el día' : (ev.time || '');
                        popup.querySelector('#pop-date').textContent = ev.day + ' de ' + meses[ev.month] + ' ' + ev.year;
                        popup.style.display = 'block';
                        var top = rect.bottom + window.scrollY + 8;
                        var left = rect.left + window.scrollX;
                        popup.style.top = top + 'px';
                        popup.style.left = left + 'px';
                    }
                });

                col.appendChild(card);
            })(dayEvents[e], e);
        }

        grid.appendChild(col);
    }

    lucide.createIcons();
}

function switchView(view) {
    currentView = view;
    var calLayout = document.querySelector('.calendar-layout');
    var agendaWrap = document.getElementById('agenda-wrap');
    var weekWrap = document.getElementById('week-wrap');
    var mobilePanel = document.querySelector('.mobile-cal-panel');

    // esconder todo primero
    if (calLayout) calLayout.style.display = 'none';
    agendaWrap.style.display = 'none';
    if (weekWrap) weekWrap.style.display = 'none';
    if (mobilePanel) mobilePanel.style.display = 'none';

    if (view === 'agenda') {
        agendaWrap.style.display = '';
        agendaWrap.style.animation = 'none';
        void agendaWrap.offsetWidth;
        agendaWrap.style.animation = 'agendaFadeIn 0.18s ease both';
        renderAgenda(calState.month, calState.year);
    } else if (view === 'week') {
        if (weekWrap) {
            weekWrap.style.display = '';
            weekWrap.classList.remove('week-anim');
            void weekWrap.offsetWidth;
            weekWrap.classList.add('week-anim');
        }
        if (!weekStart) weekStart = getMonday(new Date());
        renderWeek(weekStart);
    } else {
        if (window.innerWidth <= 480) {
            if (mobilePanel) mobilePanel.style.display = '';
        } else {
            if (calLayout) calLayout.style.display = '';
        }
        renderCalendar(calState.month, calState.year);
    }
}

document.querySelectorAll('.view-chip').forEach(function(chip) {
    chip.addEventListener('click', function() {
        document.querySelectorAll('.view-chip').forEach(function(c) { c.classList.remove('active'); });
        this.classList.add('active');
        var txt = this.textContent.trim();
        var view = txt === 'Agenda' ? 'agenda' : txt === 'Semana' ? 'week' : 'month';
        switchView(view);
    });
});

document.querySelectorAll('#view-toggle-desk .view-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
        document.querySelectorAll('#view-toggle-desk .view-btn').forEach(function(b) { b.classList.remove('active'); });
        this.classList.add('active');
        var txt = this.textContent.trim();
        var view = txt === 'Agenda' ? 'agenda' : txt === 'Semana' ? 'week' : 'month';
        switchView(view);
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

// panel de proximos eventos
function renderUpcoming() {
    var panel = document.getElementById('upcoming-sections');
    if (!panel) return;

    var hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    var manana = new Date(hoy); manana.setDate(hoy.getDate() + 1);
    var finSemana = new Date(hoy); finSemana.setDate(hoy.getDate() + 7);

    var proximos = events.filter(function(ev) {
        return new Date(ev.year, ev.month, ev.day) >= hoy;
    });
    proximos.sort(function(a, b) {
        return new Date(a.year, a.month, a.day) - new Date(b.year, b.month, b.day);
    });

    var grupos = { hoy: [], manana: [], semana: [], resto: [] };
    proximos.forEach(function(ev) {
        var d = new Date(ev.year, ev.month, ev.day);
        if (d.getTime() === hoy.getTime()) grupos.hoy.push(ev);
        else if (d.getTime() === manana.getTime()) grupos.manana.push(ev);
        else if (d < finSemana) grupos.semana.push(ev);
        else grupos.resto.push(ev);
    });

    var labels = { hoy: 'Hoy', manana: 'Mañana', semana: 'Esta semana', resto: 'Próximo' };
    var html = '';
    ['hoy', 'manana', 'semana', 'resto'].forEach(function(k) {
        if (!grupos[k].length) return;
        html += '<div class="upcoming-section"><div class="upcoming-section-label">' + labels[k] + '</div>';
        grupos[k].forEach(function(ev) {
            var showDate = (k === 'semana' || k === 'resto');
            var fechaStr = showDate ? new Date(ev.year, ev.month, ev.day).toLocaleDateString('es', { weekday: 'short', day: 'numeric' }) : '';
            html += '<div class="upcoming-event-card ev-' + getUrgency(ev) + '" data-id="' + ev.id + '">'
                + '<div class="upcoming-event-bar" style="background:' + ev.color + '"></div>'
                + '<div class="upcoming-event-info">'
                + '<div class="upcoming-event-title">' + ev.title + '</div>'
                + '<div class="upcoming-event-time">' + (showDate ? fechaStr + ' · ' : '') + (ev.time === 'Todo el dia' ? 'Todo el día' : ev.time) + '</div>'
                + '</div></div>';
        });
        html += '</div>';
    });

    if (!proximos.length) {
        html = '<div class="empty-state"><i data-lucide="calendar-x"></i><p>Sin eventos próximos</p></div>';
    }

    panel.innerHTML = html;
    lucide.createIcons();

    panel.querySelectorAll('.upcoming-event-card').forEach(function(card) {
        card.addEventListener('click', function() {
            var id = parseInt(card.dataset.id);
            var ev = events.find(function(e) { return e.id === id; });
            if (!ev) return;
            if (window.innerWidth <= 480) { openMobileEventSheet(id); return; }
            document.getElementById('pop-dot').style.background = ev.color;
            document.getElementById('pop-title').textContent = ev.title;
            document.getElementById('pop-time').textContent = ev.time === 'Todo el dia' ? 'Todo el día' : ev.time;
            document.getElementById('pop-date').textContent = ev.day + ' de ' + meses[ev.month] + ' ' + ev.year;
            var rect = card.getBoundingClientRect();
            popup.style.top  = (rect.bottom + 6 + window.scrollY) + 'px';
            popup.style.left = Math.max(8, Math.min(rect.left - 60, window.innerWidth - 288)) + 'px';
            popup.classList.add('show');
            currentEventId = id;
            var delBtn = document.getElementById('pop-delete');
            if (delBtn) { delBtn.textContent = 'Eliminar'; delBtn.style.color = '#ef4444'; }
            clearActiveCell();
            lucide.createIcons();
        });
    });
}

function openDayDetail(day, dayEvents) {
    var overlay = document.getElementById('day-detail-overlay');
    var title   = document.getElementById('day-detail-title');
    var list    = document.getElementById('day-detail-list');
    var addBtn  = document.getElementById('btn-add-from-detail');

    title.textContent = day + ' de ' + meses[calState.month] + ' ' + calState.year;
    list.innerHTML = '';

    dayEvents.forEach(function(ev) {
        var card = document.createElement('div');
        card.className = 'day-detail-card ev-' + getUrgency(ev);
        card.innerHTML = '<span class="day-detail-dot" style="background:' + ev.color + '"></span>'
            + '<span class="day-detail-ev-title">' + ev.title + '</span>'
            + '<span class="day-detail-ev-time">' + ev.time + '</span>'
            + '<span class="ev-urgency-dot"></span>';
        card.addEventListener('click', function() {
            closeDayDetail();
            document.getElementById('pop-dot').style.background = ev.color;
            document.getElementById('pop-title').textContent = ev.title;
            document.getElementById('pop-time').textContent  = ev.time;
            document.getElementById('pop-date').textContent  = ev.day + ' de ' + meses[ev.month] + ' ' + ev.year;
            popup.style.top  = '50%';
            popup.style.left = '50%';
            popup.style.transform = 'translate(-50%,-50%)';
            popup.classList.add('show');
            currentEventId = ev.id;
            var delBtn = document.getElementById('pop-delete');
            if (delBtn) { delBtn.textContent = 'Eliminar'; delBtn.style.color = '#ef4444'; }
            lucide.createIcons();
        });
        list.appendChild(card);
    });

    var mm = String(calState.month + 1).padStart(2, '0');
    var dd = String(day).padStart(2, '0');
    var dateStr = calState.year + '-' + mm + '-' + dd;
    addBtn.onclick = function() { closeDayDetail(); openModal(dateStr); };

    overlay.classList.add('show');
    lucide.createIcons();
}

function closeDayDetail() {
    document.getElementById('day-detail-overlay').classList.remove('show');
}

document.getElementById('day-detail-close').addEventListener('click', closeDayDetail);
document.getElementById('day-detail-overlay').addEventListener('click', function(e) {
    if (e.target === this) closeDayDetail();
});

renderCalendar(calState.month, calState.year);
renderMiniCal(calState.month, calState.year);
renderUpcoming();

var _hoyInit = new Date();
var _mismoMes = _hoyInit.getMonth() === calState.month && _hoyInit.getFullYear() === calState.year;
renderMobileEventList(_mismoMes ? _hoyInit.getDate() : null, calState.month, calState.year);

// panel full-screen móvil
var mobileFormPanel = document.getElementById('mobile-form-panel');
var mobileEditingId = null;

function openMobileForm(editId, dateStr) {
    var hoy = new Date();
    var mm = String(hoy.getMonth() + 1).padStart(2, '0');
    var dd = String(hoy.getDate()).padStart(2, '0');
    var defaultDate = dateStr || (hoy.getFullYear() + '-' + mm + '-' + dd);

    if (editId) {
        var ev = events.find(function(e) { return e.id === editId; });
        if (!ev) return;
        document.getElementById('mfp-title').textContent = 'Editar evento';
        document.getElementById('mev-title').value = ev.title;
        var evm = String(ev.month + 1).padStart(2, '0');
        var evd = String(ev.day).padStart(2, '0');
        document.getElementById('mev-date').value = ev.year + '-' + evm + '-' + evd;
        document.getElementById('mev-time').value = ev.time || '';
        document.getElementById('mev-allday').checked = false;
        document.getElementById('mev-time').disabled = false;
        document.getElementById('mev-time').style.opacity = '1';
        document.querySelectorAll('#mev-swatches .swatch').forEach(function(s) { s.classList.remove('active'); });
        var match = document.querySelector('#mev-swatches .swatch[data-color="' + ev.color + '"]');
        if (match) match.classList.add('active');
        else document.querySelector('#mev-swatches .swatch').classList.add('active');
        mobileEditingId = editId;
    } else {
        document.getElementById('mfp-title').textContent = 'Nuevo evento';
        document.getElementById('mev-title').value = '';
        document.getElementById('mev-date').value = defaultDate;
        document.getElementById('mev-time').value = '';
        document.getElementById('mev-allday').checked = false;
        document.getElementById('mev-time').disabled = false;
        document.getElementById('mev-time').style.opacity = '1';
        document.querySelectorAll('#mev-swatches .swatch').forEach(function(s) { s.classList.remove('active'); });
        document.querySelector('#mev-swatches .swatch[data-color="#7c3aed"]').classList.add('active');
        mobileEditingId = null;
    }

    document.getElementById('mev-title-error').style.display = 'none';
    mobileFormPanel.classList.add('open');
    lucide.createIcons();
}

function closeMobileForm() {
    mobileFormPanel.classList.add('closing');
    mobileFormPanel.addEventListener('animationend', function handler() {
        mobileFormPanel.classList.remove('open', 'closing');
        mobileFormPanel.removeEventListener('animationend', handler);
    });
    mobileEditingId = null;
}

document.getElementById('mfp-back').addEventListener('click', closeMobileForm);

document.querySelectorAll('#mev-swatches .swatch').forEach(function(sw) {
    sw.addEventListener('click', function() {
        document.querySelectorAll('#mev-swatches .swatch').forEach(function(s) { s.classList.remove('active'); });
        this.classList.add('active');
    });
});

document.getElementById('mev-allday').addEventListener('change', function() {
    document.getElementById('mev-time').disabled = this.checked;
    document.getElementById('mev-time').style.opacity = this.checked ? '0.4' : '1';
});

document.getElementById('mfp-save').addEventListener('click', function() {
    var titleVal = document.getElementById('mev-title').value.trim();
    var dateVal  = document.getElementById('mev-date').value;
    var errEl    = document.getElementById('mev-title-error');

    errEl.style.display = 'none';

    if (!titleVal) {
        errEl.textContent = 'El título es obligatorio';
        showErr(errEl);
        return;
    }
    if (!dateVal) {
        errEl.textContent = 'La fecha es obligatoria';
        showErr(errEl);
        return;
    }

    var fd = new FormData();
    fd.append('title', titleVal);
    fd.append('date',  dateVal);
    fd.append('time',  document.getElementById('mev-time').value);
    fd.append('color', document.querySelector('#mev-swatches .swatch.active').dataset.color);
    if (document.getElementById('mev-allday').checked) fd.append('all_day', '1');

    var url = 'save_event.php';
    if (mobileEditingId) {
        fd.append('id', mobileEditingId);
        url = 'update_event.php';
    }

    fetch(url, { method: 'POST', body: fd })
        .then(function(r) { return r.json(); })
        .then(function(data) {
            if (!data.ok) {
                errEl.textContent = data.error;
                showErr(errEl);
                return;
            }
            if (mobileEditingId) {
                for (var i = 0; i < events.length; i++) {
                    if (events[i].id === mobileEditingId) { events[i] = data.event; break; }
                }
            } else {
                events.push(data.event);
            }
            var toastMsg = mobileEditingId ? 'Evento actualizado' : 'Evento guardado';
            closeMobileForm();
            renderMiniCal(calState.month, calState.year);
            renderMobileEventList(null, calState.month, calState.year);
            if (currentView === 'agenda') renderAgenda(calState.month, calState.year);
            renderUpcoming();
            showToast(toastMsg);
        })
        .catch(function() {
            errEl.textContent = 'error al guardar, intenta de nuevo';
            showErr(errEl);
        });
});

// bottom sheet detalle evento móvil
var mevSheetOverlay = document.getElementById('mev-sheet-overlay');
var mobileCurrentEvId = null;
var mobileDeleteTimer = null;

function openMobileEventSheet(evId) {
    var ev = events.find(function(e) { return e.id === evId; });
    if (!ev) return;
    mobileCurrentEvId = evId;

    document.getElementById('mev-sheet-dot').style.background = ev.color;
    document.getElementById('mev-sheet-title').textContent = ev.title;
    document.getElementById('mev-sheet-time').textContent  = ev.time || 'Todo el día';
    document.getElementById('mev-sheet-date').textContent  = ev.day + ' de ' + meses[ev.month] + ' ' + ev.year;

    var delBtn = document.getElementById('mev-sheet-delete');
    delete delBtn.dataset.confirming;
    delBtn.querySelector('span').textContent = 'Eliminar';
    delBtn.style.background = 'rgba(239,68,68,0.12)';
    delBtn.style.color = '#ef4444';

    mevSheetOverlay.classList.add('show');
    lucide.createIcons();
}

function closeMevSheet(callback) {
    var sheet = mevSheetOverlay.querySelector('.mev-sheet');
    mevSheetOverlay.classList.add('closing');
    sheet.addEventListener('animationend', function handler() {
        sheet.removeEventListener('animationend', handler);
        mevSheetOverlay.classList.remove('show', 'closing');
        if (callback) callback();
    });
}

mevSheetOverlay.addEventListener('click', function(e) {
    if (e.target === this) closeMevSheet();
});

document.getElementById('mev-sheet-edit').addEventListener('click', function() {
    var evId = mobileCurrentEvId;
    closeMevSheet(function() { openMobileForm(evId); });
});

document.getElementById('mev-sheet-delete').addEventListener('click', function() {
    var btn = this;

    if (!btn.dataset.confirming) {
        btn.dataset.confirming = '1';
        btn.querySelector('span').textContent = '¿Confirmar?';
        btn.style.background = 'rgba(245,158,11,0.15)';
        btn.style.color = '#f59e0b';
        mobileDeleteTimer = setTimeout(function() {
            delete btn.dataset.confirming;
            btn.querySelector('span').textContent = 'Eliminar';
            btn.style.background = 'rgba(239,68,68,0.12)';
            btn.style.color = '#ef4444';
        }, 2000);
        return;
    }

    clearTimeout(mobileDeleteTimer);
    if (!mobileCurrentEvId) return;

    fetch('delete_event.php', {
        method: 'POST',
        body: new URLSearchParams({ id: mobileCurrentEvId })
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
        if (!data.ok) return;
        events = events.filter(function(ev) { return ev.id !== mobileCurrentEvId; });
        mobileCurrentEvId = null;
        renderMiniCal(calState.month, calState.year);
        renderMobileEventList(null, calState.month, calState.year);
        if (currentView === 'agenda') renderAgenda(calState.month, calState.year);
        renderUpcoming();
        closeMevSheet();
    });
});

lucide.createIcons();
