// toggle tema
function toggleTheme() {
    document.body.classList.toggle('light-mode');
    var isLight = document.body.classList.contains('light-mode');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
}

document.getElementById('btn-theme-desk').addEventListener('click', toggleTheme);
document.getElementById('btn-theme-m').addEventListener('click', toggleTheme);

var meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

var calState = { month: 2, year: 2026 };

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
    var cells = grid.querySelectorAll('.cal-cell');
    for (var c = 0; c < cells.length; c++) {
        cells[c].remove();
    }

    var hoy = new Date();
    var esHoy = (hoy.getMonth() === month && hoy.getFullYear() === year);
    var diaHoy = hoy.getDate();

    for (var o = 0; o < offset; o++) {
        var empty = document.createElement('div');
        empty.className = 'cal-cell';
        grid.appendChild(empty);
    }

    for (var d = 1; d <= totalDays; d++) {
        var cell = document.createElement('div');
        cell.className = 'cal-cell';

        var numEl = document.createElement('div');
        numEl.className = 'cal-day-num' + (esHoy && d === diaHoy ? ' today' : '');
        numEl.textContent = d;
        cell.appendChild(numEl);

        if (monthEvents[d]) {
            var evList = monthEvents[d];
            var max = Math.min(evList.length, 2);
            for (var e = 0; e < max; e++) {
                var evEl = document.createElement('div');
                evEl.className = 'cal-event';
                evEl.style.background = evList[e].color + '22';
                evEl.style.color = evList[e].color;
                evEl.dataset.id    = evList[e].id;
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

// modal
var modalOverlay = document.getElementById('modal-overlay');

function openModal() {
    var hoy = new Date();
    var mm = String(hoy.getMonth() + 1).padStart(2, '0');
    var dd = String(hoy.getDate()).padStart(2, '0');
    document.getElementById('ev-date').value = hoy.getFullYear() + '-' + mm + '-' + dd;
    modalOverlay.classList.add('show');
    lucide.createIcons();
}

function closeModal() {
    modalOverlay.classList.remove('show');
    editingEventId = null;
    document.querySelector('.modal-title').textContent = 'Nuevo evento';
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
        errEl.style.display = 'block';
        return;
    }
    if (!dateVal) {
        errEl.textContent = 'La fecha es obligatoria';
        errEl.style.display = 'block';
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
    saveBtn.textContent = 'Guardando...';

    fetch(url, { method: 'POST', body: fd })
        .then(function(r) { return r.json(); })
        .then(function(data) {
            saveBtn.disabled = false;
            saveBtn.textContent = 'Guardar';
            if (!data.ok) {
                errEl.textContent = data.error;
                errEl.style.display = 'block';
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
            closeModal();
            renderCalendar(calState.month, calState.year);
            renderMiniCal(calState.month, calState.year);
            showToast(msg);
            document.getElementById('ev-title').value = '';
            document.getElementById('ev-time').value = '';
            document.getElementById('ev-allday').checked = false;
            document.getElementById('ev-time').disabled = false;
            document.getElementById('ev-time').style.opacity = '1';
            document.querySelectorAll('.swatch').forEach(function(s) { s.classList.remove('active'); });
            document.querySelector('.swatch[data-color="#7c3aed"]').classList.add('active');
        })
        .catch(function() {
            saveBtn.disabled = false;
            saveBtn.textContent = 'Guardar';
            errEl.textContent = 'error al guardar, intenta de nuevo';
            errEl.style.display = 'block';
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
    calState.month = hoy.getMonth();
    calState.year = hoy.getFullYear();
    renderCalendar(calState.month, calState.year);
});

var sidebar = document.querySelector('.sidebar');
var overlay = document.getElementById('sidebar-overlay');

document.querySelector('.btn-hamburger').addEventListener('click', function() {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('show');
});

overlay.addEventListener('click', function() {
    sidebar.classList.remove('open');
    overlay.classList.remove('show');
});

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
    + '<div class="ev-popup-meta" style="margin-top:2px"><i data-lucide="calendar" style="width:12px;height:12px"></i><span id="pop-date"></span></div>'
    + '<div style="margin-top:10px;border-top:1px solid var(--border);padding-top:8px;display:flex;gap:14px;align-items:center;justify-content:center">'
    + '<button id="pop-edit" style="background:none;border:none;color:#7c3aed;font-size:11px;font-weight:600;cursor:pointer;font-family:Poppins,sans-serif;padding:0">Editar</button>'
    + '<button id="pop-delete" style="background:none;border:none;color:#ef4444;font-size:11px;font-weight:600;cursor:pointer;font-family:Poppins,sans-serif;padding:0">Eliminar</button>'
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
        events = events.filter(function(ev) { return ev.id !== currentEventId; });
        currentEventId = null;
        renderCalendar(calState.month, calState.year);
        renderMiniCal(calState.month, calState.year);
        closePopup();
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
    } else if (!e.target.closest('.ev-popup')) {
        closePopup();
    }
});

function showToast(msg) {
    var t = document.createElement('div');
    t.className = 'cal-toast';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function() {
        t.classList.add('hide');
        t.addEventListener('animationend', function() { t.remove(); });
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

var _hoyInit = new Date();
var _mismoMes = _hoyInit.getMonth() === calState.month && _hoyInit.getFullYear() === calState.year;
renderMobileEventList(_mismoMes ? _hoyInit.getDate() : null, calState.month, calState.year);

// panel full-screen móvil
var mobileFormPanel = document.getElementById('mobile-form-panel');
var mobileEditingId = null;

function openMobileForm(editId) {
    var hoy = new Date();
    var mm = String(hoy.getMonth() + 1).padStart(2, '0');
    var dd = String(hoy.getDate()).padStart(2, '0');

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
        document.getElementById('mev-date').value = hoy.getFullYear() + '-' + mm + '-' + dd;
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
        errEl.style.display = 'block';
        return;
    }
    if (!dateVal) {
        errEl.textContent = 'La fecha es obligatoria';
        errEl.style.display = 'block';
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
                errEl.style.display = 'block';
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
            showToast(toastMsg);
        })
        .catch(function() {
            errEl.textContent = 'error al guardar, intenta de nuevo';
            errEl.style.display = 'block';
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
        closeMevSheet();
    });
});

lucide.createIcons();
