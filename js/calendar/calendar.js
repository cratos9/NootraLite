// toggle tema
function toggleTheme() {
    var isCurrentlyLight = document.body.classList.contains('light-mode') || document.documentElement.classList.contains('light-mode');
    var isLight = !isCurrentlyLight;
    document.body.classList.toggle('light-mode', isLight);
    document.documentElement.classList.toggle('light-mode', isLight);
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
function getTip(u) {
    return u === 'past' ? 'Vencido' : u === 'soon' ? 'Próximo' : 'Futuro';
}

function toggleDone(evId) {
    var ev = events.find(function(e) { return e.id === evId; });
    if (!ev) return;
    var newDone = +ev.is_done ? 0 : 1;
    fetch('mark_done.php', { method: 'POST', body: new URLSearchParams({ event_id: evId, done: newDone }) })
    .then(function(r) { return r.json(); })
    .then(function(res) {
        if (!res.ok) return;
        ev.is_done = newDone;
        document.querySelectorAll('[data-ev-id="' + evId + '"]').forEach(function(el) {
            el.classList.toggle('ev-done', newDone === 1);
            var btn = el.querySelector('.btn-ev-check');
            if (btn) { btn.classList.toggle('done', newDone === 1); btn.title = newDone ? 'Desmarcar' : 'Marcar completado'; }
        });
        var popDone = document.getElementById('pop-done');
        if (popDone && currentEventId === evId) popDone.textContent = newDone ? 'Desmarcar completado' : 'Marcar completado';
        var mevDone = document.getElementById('mev-sheet-done');
        if (mevDone && mobileCurrentEvId === evId) { mevDone.querySelector('span').textContent = newDone ? 'Desmarcar' : 'Completado'; mevDone.classList.toggle('done', newDone === 1); }
        message.success(newDone ? 'Evento completado' : 'Evento desmarcado');
    });
}

function makeCheckBtn(evId, isDone) {
    var btn = document.createElement('button');
    btn.className = 'btn-ev-check' + (+isDone ? ' done' : '');
    btn.title = +isDone ? 'Desmarcar' : 'Marcar completado';
    btn.addEventListener('click', function(e) { e.stopPropagation(); toggleDone(evId); });
    return btn;
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
                if (evList[e].is_done) evEl.classList.add('ev-done');
                evEl.style.background = evList[e].color + '22';
                evEl.style.color = evList[e].color;
                evEl.dataset.id    = evList[e].id;
                evEl.dataset.evId  = evList[e].id;
                evEl.dataset.title = evList[e].title;
                evEl.dataset.time  = evList[e].time;
                evEl.dataset.color = evList[e].color;
                evEl.dataset.day   = d;
                evEl.textContent = evList[e].title;
                var urgDot = document.createElement('span');
                urgDot.className = 'ev-urgency-dot';
                urgDot.dataset.tip = getTip(getUrgency(evList[e]));
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
            reRenderAll();
            message.success(msg);
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
    + '<button id="pop-done" class="ev-popup-action-btn done-btn">Marcar completado</button>'
    + '<button id="pop-edit" class="ev-popup-action-btn edit">Editar</button>'
    + '<button id="pop-delete" class="ev-popup-action-btn delete">Eliminar</button>'
    + '</div>';
document.body.appendChild(popup);

document.getElementById('pop-close').addEventListener('click', function() {
    closePopup();
});

document.getElementById('pop-done').addEventListener('click', function() {
    toggleDone(currentEventId);
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
        message.error('Evento eliminado');
        closePopup(function() { reRenderAll(); });
        return;
    })
    .catch(function() {
        btn.textContent = 'Eliminar';
        btn.style.color = '#ef4444';
    });
});

var activeCell = null;

var calClickTimer = null;

function openEventEditModal(ev) {
    editingEventId = ev.id;
    document.querySelector('.modal-title').textContent = 'Editar evento';
    document.getElementById('ev-title').value = ev.title;
    var mm = String(ev.month + 1).padStart(2, '0');
    var dd = String(ev.day).padStart(2, '0');
    document.getElementById('ev-date').value = ev.year + '-' + mm + '-' + dd;
    document.getElementById('ev-time').value = ev.time || '';
    var allDay = !!ev.all_day;
    document.getElementById('ev-allday').checked = allDay;
    document.getElementById('ev-time').disabled = allDay;
    document.getElementById('ev-time').style.opacity = allDay ? '0.4' : '1';
    document.querySelectorAll('.swatch').forEach(function(s) { s.classList.remove('active'); });
    var match = document.querySelector('.swatch[data-color="' + ev.color + '"]');
    if (match) match.classList.add('active');
    else document.querySelector('.swatch').classList.add('active');
    var saveBtn = document.querySelector('.btn-save-ev');
    if (saveBtn) saveBtn.textContent = 'Guardar cambios';
    modalOverlay.classList.add('show');
    lucide.createIcons();
}

function showEventPopupAt(ev, el) {
    document.getElementById('pop-dot').style.background = ev.color;
    document.getElementById('pop-title').textContent = ev.title;
    document.getElementById('pop-time').textContent = ev.all_day ? 'Todo el día' : (ev.time || '');
    document.getElementById('pop-date').textContent = ev.day + ' de ' + meses[ev.month] + ' ' + ev.year;
    var delBtn = document.getElementById('pop-delete');
    if (delBtn) { delBtn.textContent = 'Eliminar'; delBtn.style.color = '#ef4444'; }
    var doneBtn = document.getElementById('pop-done');
    if (doneBtn) doneBtn.textContent = ev.is_done ? 'Desmarcar completado' : 'Marcar completado';
    var rect = el.getBoundingClientRect();
    posPopup(rect, 6);
    popup.style.left = Math.min(rect.left, window.innerWidth - 288) + 'px';
    popup.classList.add('show');
    currentEventId = ev.id;
    lucide.createIcons();
}

function reRenderAll() {
    renderCalendar(calState.month, calState.year);
    renderMiniCal(calState.month, calState.year);
    if (currentView === 'week') renderWeek(weekStart);
    if (currentView === 'agenda') renderAgenda(calState.month, calState.year);
    renderMobileEventList(null, calState.month, calState.year);
    renderUpcoming();
}

function clearActiveCell() {
    if (activeCell) {
        activeCell.classList.remove('active-cell');
        activeCell = null;
    }
}

function posPopup(rect, gapPx) {
    var ph = 160;
    popup.classList.remove('above', 'below');
    popup.style.transform = '';
    if (rect.bottom + gapPx + ph > window.innerHeight) {
        popup.style.top = (rect.top - ph - gapPx + window.scrollY) + 'px';
        popup.classList.add('above');
    } else {
        popup.style.top = (rect.bottom + gapPx + window.scrollY) + 'px';
        popup.classList.add('below');
    }
}

function closePopup(callback) {
    if (!popup.classList.contains('show')) return;
    popup.classList.add('closing');
    popup.addEventListener('animationend', function handler() {
        popup.classList.remove('show', 'closing', 'above', 'below');
        popup.style.transform = '';
        popup.removeEventListener('animationend', handler);
        clearActiveCell();
        if (callback) callback();
    });
}

document.addEventListener('click', function(e) {
    if (e.target.closest('.cal-event')) {
        var el = e.target.closest('.cal-event');
        var evId = el.dataset.id ? parseInt(el.dataset.id) : null;
        var ev = events.find(function(e) { return e.id === evId; });
        if (!ev) return;
        clearActiveCell();
        if (calClickTimer) { clearTimeout(calClickTimer); calClickTimer = null; return; }
        var _ev = ev, _el = el;
        calClickTimer = setTimeout(function() {
            calClickTimer = null;
            openEventEditModal(_ev);
        }, 220);
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

document.addEventListener('dblclick', function(e) {
    var calEv = e.target.closest('.cal-event');
    if (calEv && window.innerWidth > 480) {
        if (calClickTimer) { clearTimeout(calClickTimer); calClickTimer = null; }
        var evId = calEv.dataset.id ? parseInt(calEv.dataset.id) : null;
        var ev = events.find(function(ev) { return ev.id === evId; });
        if (ev) showEventPopupAt(ev, calEv);
    }
});

document.addEventListener('contextmenu', function(e) {
    var calEv = e.target.closest('.cal-event');
    if (calEv && window.innerWidth > 480) {
        e.preventDefault();
        if (calClickTimer) { clearTimeout(calClickTimer); calClickTimer = null; }
        var evId = calEv.dataset.id ? parseInt(calEv.dataset.id) : null;
        var ev = events.find(function(ev) { return ev.id === evId; });
        if (ev) showEventPopupAt(ev, calEv);
    }
});

function showErr(el) {
    el.classList.remove('form-error');
    el.style.display = 'block';
    el.offsetHeight; // fuerza reflow para re-disparar animation
    el.classList.add('form-error');
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
        if (ev.is_done) card.classList.add('ev-done');

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

        var urgDot = document.createElement('span');
        urgDot.className = 'ev-urgency-dot';
        urgDot.dataset.tip = getTip(getUrgency(ev));

        card.dataset.evId = ev.id;
        card.appendChild(bar);
        card.appendChild(info);
        card.appendChild(urgDot);
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

    var hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    var agWrap = document.getElementById('agenda-wrap');
    if (agWrap) {
        agWrap.style.animation = 'none';
        void agWrap.offsetWidth;
        agWrap.style.animation = 'agendaFadeIn 0.18s ease both';
    }

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
            if (new Date(year, month, ev.day) < new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()))
                dayLabel.classList.add('agenda-day-past');
            list.appendChild(dayLabel);
        }

        var item = document.createElement('div');
        item.className = 'agenda-item ev-' + getUrgency(ev);
        if (ev.is_done) item.classList.add('ev-done');
        if (ev.day === hoy.getDate() && month === hoy.getMonth() && year === hoy.getFullYear())
            item.classList.add('agenda-today');
        item.style.animationDelay = (j * 0.04) + 's';
        item.dataset.evId = ev.id;

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
        item.appendChild(makeCheckBtn(ev.id, !!ev.is_done));
        (function(evData, itemEl) {
            var _agTimer = null;
            itemEl.addEventListener('click', function() {
                if (window.innerWidth <= 480) { openMobileEventSheet(evData.id); return; }
                if (_agTimer) { clearTimeout(_agTimer); _agTimer = null; return; }
                _agTimer = setTimeout(function() { _agTimer = null; openEventEditModal(evData); }, 220);
            });
            itemEl.addEventListener('dblclick', function() {
                if (window.innerWidth <= 480) return;
                if (_agTimer) { clearTimeout(_agTimer); _agTimer = null; }
                showEventPopupAt(evData, itemEl);
            });
            itemEl.addEventListener('contextmenu', function(e) {
                e.preventDefault();
                if (window.innerWidth <= 480) return;
                showEventPopupAt(evData, itemEl);
            });
        })(ev, item);

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
        col.style.animationDelay = (d * 0.035) + 's';

        // label visible en mobile
        var mLabel = document.createElement('span');
        mLabel.className = 'week-day-label';
        mLabel.textContent = diasSemana[curr.getDay()] + ' ' + curr.getDate();
        col.appendChild(mLabel);

        if (isToday) {
            var nowLine = document.createElement('div');
            nowLine.className = 'week-now-line';
            let ahora = new Date();
            var hrs = ahora.getHours(), mins = ahora.getMinutes();
            nowLine.innerHTML = '<span>' + (hrs<10?'0':'') + hrs + ':' + (mins<10?'0':'') + mins + '</span>';
            col.appendChild(nowLine);
        }

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
                if (ev.is_done) card.classList.add('ev-done');
                card.style.animationDelay = (d * 0.03 + idx * 0.04) + 's';

                var bar = document.createElement('span');
                bar.className = 'week-ev-bar';
                bar.style.background = ev.color;
                card.appendChild(bar);

                var content = document.createElement('div');
                content.className = 'week-ev-content';

                var titleEl = document.createElement('span');
                titleEl.className = 'week-ev-title';
                titleEl.textContent = ev.title;
                content.appendChild(titleEl);

                if (ev.time && !ev.all_day) {
                    var timeEl = document.createElement('span');
                    timeEl.className = 'week-event-time';
                    timeEl.textContent = ev.time;
                    content.appendChild(timeEl);
                }

                card.appendChild(content);
                if (window.innerWidth > 480) card.appendChild(makeCheckBtn(ev.id, !!ev.is_done));
                card.dataset.evId = ev.id;
                var _wTimer = null;
                card.addEventListener('click', function(e) {
                    e.stopPropagation();
                    var t = document.getElementById('week-tip'); if (t) t.style.opacity = '0';
                    if (window.innerWidth <= 480) { openMobileEventSheet(ev.id); return; }
                    if (_wTimer) { clearTimeout(_wTimer); _wTimer = null; return; }
                    var _wEv = ev;
                    _wTimer = setTimeout(function() { _wTimer = null; openEventEditModal(_wEv); }, 220);
                });
                card.addEventListener('dblclick', function(e) {
                    e.stopPropagation();
                    if (window.innerWidth <= 480) return;
                    if (_wTimer) { clearTimeout(_wTimer); _wTimer = null; }
                    showEventPopupAt(ev, card);
                });
                card.addEventListener('contextmenu', function(e) {
                    e.preventDefault(); e.stopPropagation();
                    if (window.innerWidth <= 480) return;
                    showEventPopupAt(ev, card);
                });

                card.onmouseenter = function() {
                    var tip = document.getElementById('week-tip') || (function(){
                        var t = document.createElement('div');
                        t.id = 'week-tip'; t.className = 'week-tooltip';
                        document.body.appendChild(t); return t;
                    })();
                    tip.textContent = ev.title + (ev.time ? ' · ' + ev.time : '');
                    var r = card.getBoundingClientRect();
                    tip.style.top = (r.top - 32) + 'px';
                    tip.style.left = (r.left + r.width/2) + 'px';
                    tip.style.opacity = '1';
                };
                card.onmouseleave = function() {
                    var t = document.getElementById('week-tip'); if(t) t.style.opacity = '0';
                };

                col.appendChild(card);
            })(dayEvents[e], e);
        }

        grid.appendChild(col);
    }

    lucide.createIcons();
}

function switchView(view) {
    currentView = view;
    var tip = document.getElementById('week-tip'); if (tip) tip.style.opacity = '0';
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
            if (calLayout) {
                calLayout.style.display = '';
                calLayout.style.animation = 'none';
                void calLayout.offsetWidth;
                calLayout.style.animation = 'agendaFadeIn 0.18s ease both';
            }
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

var vtDesk = document.getElementById('view-toggle-desk');
var indicator = document.createElement('span');
indicator.className = 'view-indicator';
vtDesk.insertBefore(indicator, vtDesk.firstChild);

function moveIndicator(idx) {
    indicator.style.transform = 'translateX(' + (idx * 100) + '%)';
}

document.querySelectorAll('#view-toggle-desk .view-btn').forEach(function(btn, i) {
    btn.addEventListener('click', function() {
        document.querySelectorAll('#view-toggle-desk .view-btn').forEach(function(b) { b.classList.remove('active'); });
        this.classList.add('active');
        moveIndicator(i);
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
    var titleEl = document.querySelector('.upcoming-title');

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
    if (titleEl) titleEl.textContent = proximos.length ? 'Próximos · ' + proximos.length : 'Próximos eventos';

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
            html += '<div class="upcoming-event-card ev-' + getUrgency(ev) + (+ev.is_done ? ' ev-done' : '') + '" data-id="' + ev.id + '" data-ev-id="' + ev.id + '">'
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

    // staggered + limite
    var allCards = panel.querySelectorAll('.upcoming-event-card');
    allCards.forEach(function(card, i) { card.style.animationDelay = (i * 0.04) + 's'; });
    var LIMIT = 15;
    if (allCards.length > LIMIT) {
        for (var i = LIMIT; i < allCards.length; i++) allCards[i].style.display = 'none';
        var moreBtn = document.createElement('div');
        moreBtn.className = 'upcoming-more';
        moreBtn.textContent = '+ ' + (allCards.length - LIMIT) + ' más';
        moreBtn.onclick = function() {
            for (var i = LIMIT; i < allCards.length; i++) allCards[i].style.display = '';
            moreBtn.remove();
        };
        allCards[LIMIT - 1].insertAdjacentElement('afterend', moreBtn);
    }

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
            posPopup(rect, 6);
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
        if (ev.is_done) card.classList.add('ev-done');
        card.dataset.evId = ev.id;
        card.innerHTML = '<span class="day-detail-dot" style="background:' + ev.color + '"></span>'
            + '<span class="day-detail-ev-title">' + ev.title + '</span>'
            + '<div class="day-detail-right">'
            + '<span class="day-detail-ev-time">' + (ev.time || 'Todo el día') + '</span>'
            + '<span class="ev-urgency-dot" data-tip="' + getTip(getUrgency(ev)) + '"></span>'
            + '</div>';
        card.querySelector('.day-detail-right').appendChild(makeCheckBtn(ev.id, !!ev.is_done));
        card.addEventListener('click', function(e) {
            if (e.target.closest('.btn-ev-check')) return;
            closeDayDetail();
            openEventEditModal(ev);
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
            reRenderAll();
            message.success(toastMsg);
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

    var doneBtn = document.getElementById('mev-sheet-done');
    if (doneBtn) {
        doneBtn.querySelector('span').textContent = ev.is_done ? 'Desmarcar' : 'Completado';
        doneBtn.classList.toggle('done', !!ev.is_done);
    }

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

document.getElementById('mev-sheet-done').addEventListener('click', function() {
    toggleDone(mobileCurrentEvId);
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
        reRenderAll();
        closeMevSheet();
    });
});

lucide.createIcons();
