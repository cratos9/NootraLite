function escHtml(s) {
    if (!s) return '';
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

var msgPrivacyRevealed = (function() {
    try { return localStorage.getItem('nootra_msg_privacy') !== 'false'; } catch(e) { return true; }
})();

function applyPrivacyState(animate) {
    var card   = document.getElementById('recentMsgCard');
    var toggle = document.getElementById('msgPrivacyToggle');
    var lbl    = document.getElementById('dptLabel');
    var sw     = document.getElementById('dptSwitch');
    var icon   = document.getElementById('dptIconWrap');
    if (!card) return;
    card.classList.toggle('dash-msg-revealed', msgPrivacyRevealed);
    if (toggle) toggle.classList.toggle('visible', msgPrivacyRevealed);
    if (lbl) lbl.textContent = msgPrivacyRevealed ? 'Visible' : 'Privado';
    if (sw)  sw.setAttribute('aria-checked', msgPrivacyRevealed ? 'true' : 'false');
    if (animate && icon) {
        icon.classList.remove('dpt-pop');
        void icon.offsetWidth;
        icon.classList.add('dpt-pop');
    }
}

function buildPreviewInner(c) {
    if (c.is_recording == true || c.is_recording == 1) {
        return '<span class="dash-msg-recording">' +
               '<span class="dash-msg-rec-dot"></span>' +
               '<div class="dash-msg-rec-waves"><span></span><span></span><span></span><span></span><span></span></div>' +
               'Grabando audio...</span>';
    }
    if (parseInt(c.is_typing) === 1) {
        return '<span class="dash-msg-typing">' +
               '<span class="dash-msg-typing-dots">' +
               '<span class="dash-msg-typing-dot"></span>' +
               '<span class="dash-msg-typing-dot"></span>' +
               '<span class="dash-msg-typing-dot"></span>' +
               '</span>Escribiendo...</span>';
    }
    var pfx  = c.is_mine ? '<span class="dash-msg-me">Tú:</span> ' : '';
    var text = pfx + escHtml(c.last_preview || '');
    return '<span class="dash-privacy-bars"><span></span><span></span><span></span></span>' +
           '<span class="dash-privacy-text">' + text + '</span>';
}

function buildMsgRow(c, i) {
    var hasUnread = c.is_unread || parseInt(c.unread) > 0;
    var delay     = 'animation:dashFadeUp .28s cubic-bezier(.34,1.56,.64,1) ' + (i * .07) + 's both';

    return '<a class="dash-msg-row' + (hasUnread ? ' unread' : '') + '" href="../messages/messages.php?conv=' + escHtml(c.id) + '" style="' + delay + '">' +
        '<div class="dash-msg-av-wrap">' +
        '<div class="dash-msg-av" style="background-color:' + escHtml(c.avatar_color) + '">' + escHtml(c.initials) + '</div>' +
        (c.is_online == 1 ? '<span class="dash-msg-online"></span>' : '') +
        '</div>' +
        '<div class="dash-msg-body">' +
        '<span class="dash-msg-name">' + escHtml(c.other_name) + '</span>' +
        '<div class="dash-msg-preview">' + buildPreviewInner(c) + '</div>' +
        '</div>' +
        '<div class="dash-msg-right">' +
        (c.time_fmt ? '<span class="dash-msg-time">' + escHtml(c.time_fmt) + '</span>' : '') +
        (hasUnread ? '<span class="dash-msg-badge">' + (parseInt(c.unread) > 9 ? '9+' : (parseInt(c.unread) || '•')) + '</span>' : '') +
        '</div>' +
        '</a>';
}

/* ── cache y polling ── */
var _dashMsgCache    = [];
var _dashPollId      = null;
var _dashPollFetch   = false;

function _updateHeaderBadge(total) {
    var badge = document.getElementById('msgBadge');
    if (!badge) return;
    badge.textContent    = total > 9 ? '9+' : total;
    badge.style.display  = total > 0 ? 'inline-flex' : 'none';
}

function _diffRows(fresh) {
    var list = document.getElementById('dashMsgList');
    if (!list) return;

    // si cambiaron los IDs o el orden → re-render completo sin stagger
    var freshIds = fresh.map(function(c) { return c.id; }).join(',');
    var cacheIds = _dashMsgCache.map(function(c) { return c.id; }).join(',');
    if (freshIds !== cacheIds) {
        var html = '';
        fresh.forEach(function(c, i) { html += buildMsgRow(c, i); });
        list.innerHTML = html;
        lucide.createIcons({ nodes: [list] });
        applyPrivacyState();
        return;
    }

    var rows = list.querySelectorAll('.dash-msg-row');
    fresh.forEach(function(c, i) {
        var prev = _dashMsgCache[i];
        var row  = rows[i];
        if (!row || !prev) return;

        // online dot
        if (String(c.is_online) !== String(prev.is_online)) {
            var dot = row.querySelector('.dash-msg-online');
            if (c.is_online == 1 && !dot) {
                var avw = row.querySelector('.dash-msg-av-wrap');
                if (avw) { var d = document.createElement('span'); d.className = 'dash-msg-online'; avw.appendChild(d); }
            } else if (c.is_online != 1 && dot) {
                dot.remove();
            }
        }

        // preview (typing / recording / nuevo mensaje)
        var prevChanged = String(c.is_typing)    !== String(prev.is_typing)    ||
                          String(c.is_recording) !== String(prev.is_recording) ||
                          c.last_preview !== prev.last_preview ||
                          String(c.is_mine) !== String(prev.is_mine);
        if (prevChanged) {
            var previewEl = row.querySelector('.dash-msg-preview');
            if (previewEl) {
                previewEl.innerHTML = buildPreviewInner(c);
                lucide.createIcons({ nodes: [previewEl] });
                applyPrivacyState();
                // flash solo si llegó mensaje nuevo (no typing/recording)
                if (c.last_preview !== prev.last_preview) {
                    previewEl.classList.remove('dash-preview-flash');
                    void previewEl.offsetWidth;
                    previewEl.classList.add('dash-preview-flash');
                }
            }
        }

        // unread badge + clase
        var hasUnread  = c.is_unread  || parseInt(c.unread)  > 0;
        var hadUnread  = prev.is_unread || parseInt(prev.unread) > 0;
        if (hasUnread !== hadUnread || c.unread !== prev.unread) {
            row.classList.toggle('unread', hasUnread);
            var right = row.querySelector('.dash-msg-right');
            if (right) {
                var badge = right.querySelector('.dash-msg-badge');
                if (hasUnread && !badge) {
                    var b = document.createElement('span');
                    b.className   = 'dash-msg-badge';
                    b.textContent = parseInt(c.unread) > 9 ? '9+' : (parseInt(c.unread) || '•');
                    right.appendChild(b);
                } else if (!hasUnread && badge) {
                    badge.remove();
                } else if (hasUnread && badge) {
                    badge.textContent = parseInt(c.unread) > 9 ? '9+' : (parseInt(c.unread) || '•');
                }
            }
        }

        // tiempo
        if (c.time_fmt !== prev.time_fmt) {
            var timeEl = row.querySelector('.dash-msg-time');
            if (timeEl) timeEl.textContent = c.time_fmt;
        }
    });
}

function _pollDashboard() {
    if (_dashPollFetch) return;
    _dashPollFetch = true;
    fetch('../Dashboard/get_recent_messages.php')
        .then(function(r) { return r.json(); })
        .then(function(res) {
            _dashPollFetch = false;
            if (!res.ok) return;
            _updateHeaderBadge(res.total_unread || 0);
            _diffRows(res.conversations || []);
            _dashMsgCache = res.conversations || [];
            if (typeof window._notifSync === 'function') window._notifSync();
        })
        .catch(function() { _dashPollFetch = false; });
}

function _startPoll() {
    if (_dashPollId) return;
    _dashPollId = setInterval(_pollDashboard, 3000);
}

function _stopPoll() {
    if (_dashPollId) { clearInterval(_dashPollId); _dashPollId = null; }
}

function loadRecentMessages() {
    var p = window._dashPrefetch
        ? window._dashPrefetch.then(function(d){ return d.messages || {ok:false}; })
        : fetch('../Dashboard/get_recent_messages.php').then(function(r){ return r.json(); });
    p.then(function(res) {
            if (!res.ok) return;
            _updateHeaderBadge(res.total_unread || 0);

            var list = document.getElementById('dashMsgList');
            if (!list) return;

            if (!res.conversations || !res.conversations.length) {
                list.innerHTML = '<div class="dash-msg-empty"><i data-lucide="message-circle-off"></i><span>Sin conversaciones aún</span></div>';
                lucide.createIcons({ nodes: [list] });
                return;
            }

            var html = '';
            res.conversations.forEach(function(c, i) { html += buildMsgRow(c, i); });
            list.innerHTML = html;
            lucide.createIcons({ nodes: [list] });
            applyPrivacyState();

            _dashMsgCache = res.conversations;
            _startPoll();
        })
        .catch(function() {
            var list = document.getElementById('dashMsgList');
            if (list) {
                list.innerHTML = '<div class="dash-msg-empty"><i data-lucide="wifi-off"></i><span>No se pudo cargar</span></div>';
                lucide.createIcons({ nodes: [list] });
            }
        });
}

var _privBtn = document.getElementById('msgPrivacyToggle');
if (_privBtn) {
    _privBtn.addEventListener('click', function() {
        msgPrivacyRevealed = !msgPrivacyRevealed;
        try { localStorage.setItem('nootra_msg_privacy', String(msgPrivacyRevealed)); } catch(e) {}
        applyPrivacyState(true);
    });
}

document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        _stopPoll();
    } else {
        _pollDashboard();
        _startPoll();
    }
});

applyPrivacyState(false);
loadRecentMessages();

// ── widget calendario ──────────────────────────────────────────────
var _calNow = new Date();
var _calY   = _calNow.getFullYear();
var _calM   = _calNow.getMonth() + 1; // 1-indexed

var CAL_MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

function _renderCalGrid(dir, eventDays, eventsByDay) {
    var body  = document.getElementById('dashCalBody');
    var mName = document.getElementById('dashCalMonthName');
    var mYear = document.getElementById('dashCalMonthYear');
    if (!body) return;

    if (mName) mName.textContent = CAL_MONTHS[_calM - 1];
    if (mYear) mYear.textContent = _calY;

    var now    = new Date();
    var todayY = now.getFullYear();
    var todayM = now.getMonth() + 1;
    var todayD = now.getDate();

    var firstDow   = new Date(_calY, _calM - 1, 1).getDay();
    var startOff   = firstDow === 0 ? 6 : firstDow - 1;
    var daysInMon  = new Date(_calY, _calM, 0).getDate();
    var daysInPrev = new Date(_calY, _calM - 1, 0).getDate();
    var evts  = eventDays   || [];
    var byDay = eventsByDay || {};

    var html = '';
    for (var i = startOff; i > 0; i--) {
        html += '<div class="dash-cal-cell empty">' + (daysInPrev - i + 1) + '</div>';
    }
    for (var d = 1; d <= daysInMon; d++) {
        var dow     = new Date(_calY, _calM - 1, d).getDay();
        var isToday = (_calY === todayY && _calM === todayM && d === todayD);
        var isPast  = !isToday && new Date(_calY, _calM - 1, d) < new Date(todayY, todayM - 1, todayD);
        var hasEvt  = evts.indexOf(d) !== -1;

        var cls = 'dash-cal-cell';
        if (isToday) cls += ' today';
        else if (isPast) cls += ' cal-past';
        if (dow === 6) cls += ' cal-sat';
        if (dow === 0) cls += ' cal-sun';
        if (hasEvt) cls += ' has-event';

        var mm2  = String(_calM).padStart(2, '0');
        var dd2  = String(d).padStart(2, '0');
        var href = '../calendar/calendar.php?day=' + _calY + '-' + mm2 + '-' + dd2;

        var dots = '';
        if (hasEvt && byDay[d] && byDay[d].length) {
            byDay[d].forEach(function(col) {
                dots += '<span class="dash-cal-edot" style="background:' + escHtml(col) + '"></span>';
            });
            dots = '<span class="dash-cal-edot-row">' + dots + '</span>';
        }

        html += '<a class="' + cls + '" data-num="' + d + '" href="' + href + '">'
              + (isToday ? '' : d) + dots + '</a>';
    }
    var total  = startOff + daysInMon;
    var remain = total % 7 === 0 ? 0 : 7 - (total % 7);
    for (var j = 1; j <= remain; j++) {
        html += '<div class="dash-cal-cell empty">' + j + '</div>';
    }

    if (dir) {
        body.classList.remove('cal-in-prev', 'cal-in-next');
        void body.offsetWidth;
        body.classList.add(dir === 'prev' ? 'cal-in-prev' : 'cal-in-next');
    }
    body.innerHTML = html;
}

function loadCalendar(dir) {
    var now = new Date();
    var isCurrent = (_calY === now.getFullYear() && _calM === now.getMonth() + 1);
    var p;
    if (!dir && isCurrent && window._dashPrefetch) {
        p = window._dashPrefetch.then(function(d){
            return {event_days: d.event_days_current || [], events_by_day: d.events_by_day_current || {}};
        });
    } else {
        p = fetch('../Dashboard/get_month_events.php?year=' + _calY + '&month=' + _calM)
                .then(function(r){ return r.json(); });
    }
    p.then(function(data) { _renderCalGrid(dir, data.event_days || [], data.events_by_day || {}); })
     .catch(function() { _renderCalGrid(dir, [], {}); });
}

var _calPrevBtn = document.getElementById('dashCalPrev');
var _calNextBtn = document.getElementById('dashCalNext');

if (_calPrevBtn) {
    _calPrevBtn.addEventListener('click', function() {
        _calM--;
        if (_calM < 1) { _calM = 12; _calY--; }
        loadCalendar('prev');
    });
}
if (_calNextBtn) {
    _calNextBtn.addEventListener('click', function() {
        _calM++;
        if (_calM > 12) { _calM = 1; _calY++; }
        loadCalendar('next');
    });
}

loadCalendar(null);

var _calTodayBtn = document.getElementById('dashCalToday');
if (_calTodayBtn) {
    _calTodayBtn.addEventListener('click', function() {
        var now = new Date();
        var ny = now.getFullYear(), nm = now.getMonth() + 1;
        if (ny === _calY && nm === _calM) return;
        var dir = (ny < _calY || (ny === _calY && nm < _calM)) ? 'next' : 'prev';
        _calY = ny; _calM = nm;
        loadCalendar(dir);
    });
}

// ── buscador global ────────────────────────────────────────────────
(function() {
    var inp    = document.getElementById('dashSearchInput');
    var drop   = document.getElementById('dashSearchDrop');
    var clrBtn = document.getElementById('dashSearchClear');
    var outer  = document.getElementById('dashSearchOuter');
    var topbar = document.querySelector('.dash-topbar');
    if (!inp || !drop) return;

    var _timer      = null;
    var _closeTimer = null;
    var _open       = false;
    var _lastQ      = '';
    var _active     = -1;
    var _items      = [];
    var _RECENT_KEY = 'nootra_search_recent';
    var _MAX_RECENT = 6;

    var SEC_COLORS = {
        purple: '#a78bfa',
        violet: '#818cf8',
        amber:  '#f59e0b',
        green:  '#10b981',
        blue:   '#60a5fa',
        muted:  '#475569'
    };

    // mismo algoritmo que messages-utils.js para consistencia
    var _avColors = ['#7c3aed','#ec4899','#6366f1','#06b6d4','#10b981','#f59e0b','#3b82f6','#8b5cf6'];
    function _avHash(n) { var i=0; if(n) for(var c=0;c<n.length;c++) i+=n.charCodeAt(c); return i; }
    function avatarColorDash(name) { return _avColors[_avHash(name) % _avColors.length]; }

    function hexToRgba(hex, a) {
        if (!hex || hex.length < 7) return 'rgba(124,58,237,' + a + ')';
        var r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
        return 'rgba('+r+','+g+','+b+','+a+')';
    }

    // ── historial reciente ──
    function getRecent() {
        try { return JSON.parse(localStorage.getItem(_RECENT_KEY) || '[]'); } catch(e) { return []; }
    }
    function saveRecent(q) {
        if (!q || q.length < 2) return;
        var list = getRecent().filter(function(x) { return x !== q; });
        list.unshift(q);
        list = list.slice(0, _MAX_RECENT);
        try { localStorage.setItem(_RECENT_KEY, JSON.stringify(list)); } catch(e) {}
    }
    function removeRecent(q) {
        var list = getRecent().filter(function(x) { return x !== q; });
        try { localStorage.setItem(_RECENT_KEY, JSON.stringify(list)); } catch(e) {}
    }

    // ── highlight ──
    function hlText(text, q) {
        if (!q || !text) return escHtml(text);
        var idx = text.toLowerCase().indexOf(q.toLowerCase());
        if (idx < 0) return escHtml(text);
        return escHtml(text.slice(0, idx))
             + '<mark>' + escHtml(text.slice(idx, idx + q.length)) + '</mark>'
             + escHtml(text.slice(idx + q.length));
    }

    // ── dropdown open/close ──
    function openDrop() {
        if (_closeTimer) { clearTimeout(_closeTimer); _closeTimer = null; drop.classList.remove('closing'); }
        if (_open) return;
        _open = true;
        drop.classList.remove('closing');
        drop.classList.add('open');
    }
    function closeDrop(keepFocus) {
        if (!_open) return;
        _open = false;
        _active = -1;
        _items = [];
        drop.classList.remove('open');
        drop.classList.add('closing');
        _closeTimer = setTimeout(function() {
            _closeTimer = null;
            drop.classList.remove('closing');
            drop.innerHTML = '';
        }, 190);
        if (!keepFocus) inp.blur();
    }
    function setActive(idx) {
        _items.forEach(function(el, i) { el.classList.toggle('active', i === idx); });
        _active = idx;
        if (_items[idx]) _items[idx].scrollIntoView({ block: 'nearest' });
    }

    // ── helpers de render ──
    function showLoading() {
        drop.innerHTML = '<div class="dash-search-loading"><i data-lucide="loader-2"></i>Buscando...</div>';
        lucide.createIcons({ nodes: [drop] });
        openDrop();
    }
    function showEmpty(q) {
        var sugs = ['mensajes', 'tareas', 'calendario', 'cuadernos', 'notas'];
        var sugHtml = sugs.map(function(s) { return '<button class="dash-search-sug">' + s + '</button>'; }).join('');
        drop.innerHTML = '<div class="dash-search-empty"><i data-lucide="search-x"></i>'
            + '<strong>&ldquo;' + escHtml(q) + '&rdquo;</strong>'
            + '<span>Sin resultados en ningún módulo</span>'
            + '<div class="dash-search-suggestions"><span>Prueba:</span>' + sugHtml + '</div>'
            + '</div>';
        drop.querySelectorAll('.dash-search-sug').forEach(function(btn) {
            btn.addEventListener('click', function() {
                inp.value = btn.textContent;
                if (clrBtn) clrBtn.style.display = '';
                _lastQ = '';
                doSearch(btn.textContent);
            });
        });
        lucide.createIcons({ nodes: [drop] });
        openDrop();
    }
    function showRecent() {
        var recent = getRecent();
        if (!recent.length) return;
        var html = '<div class="dash-search-sec">'
            + '<div class="dash-search-sec-lbl"><i data-lucide="clock"></i>Búsquedas recientes</div>';
        recent.forEach(function(r, i) {
            html += '<div class="dash-search-item dash-search-recent" style="--si:' + (i*20) + 'ms">'
                + '<span class="dash-search-item-icon ic-muted"><i data-lucide="clock-3"></i></span>'
                + '<span class="dash-search-item-body"><span class="dash-search-item-title">' + escHtml(r) + '</span></span>'
                + '<button class="dash-search-del-recent" data-q="' + escHtml(r) + '" aria-label="Eliminar">'
                + '<i data-lucide="x"></i></button>'
                + '</div>';
        });
        html += '<div class="dash-search-recent-footer"><button class="dash-search-clear-all">Limpiar historial</button></div>';
        html += '</div>';
        drop.innerHTML = html;
        lucide.createIcons({ nodes: [drop] });
        openDrop();

        drop.querySelectorAll('.dash-search-recent').forEach(function(el) {
            el.addEventListener('click', function(e) {
                if (e.target.closest('.dash-search-del-recent')) return;
                var q = el.querySelector('.dash-search-item-title').textContent;
                inp.value = q;
                if (clrBtn) clrBtn.style.display = '';
                _lastQ = '';
                doSearch(q);
            });
        });
        drop.querySelectorAll('.dash-search-del-recent').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                removeRecent(btn.dataset.q);
                if (!getRecent().length) { closeDrop(true); } else { showRecent(); }
            });
        });
        var clearAllBtn = drop.querySelector('.dash-search-clear-all');
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                try { localStorage.removeItem(_RECENT_KEY); } catch(ex) {}
                closeDrop(true);
            });
        }
        _items = Array.from(drop.querySelectorAll('.dash-search-item'));
        _active = -1;
    }

    // ── render resultados ──
    function renderResults(data, q) {
        var results = data.results || [];
        if (!results.length) { showEmpty(q); return; }

        var html = '';
        var delay = 0;
        results.forEach(function(sec) {
            var col = SEC_COLORS[sec.color] || SEC_COLORS.muted;
            html += '<div class="dash-search-sec">';
            html += '<div class="dash-search-sec-lbl" style="color:' + col + '">'
                + '<i data-lucide="' + escHtml(sec.icon) + '"></i>' + escHtml(sec.label)
                + '<span class="sec-count">' + sec.items.length + '</span>'
                + '</div>';
            sec.items.forEach(function(item) {
                var iconHtml;
                if (item.avatar) {
                    var avBg = avatarColorDash(item.title);
                    iconHtml = '<span class="dash-search-item-icon ic-avatar" style="background-color:' + avBg + '">'
                        + '<span class="dash-search-avatar-ltr">' + escHtml(item.avatar) + '</span>'
                        + '</span>';
                } else if (item.dot_color) {
                    var evBg = hexToRgba(item.dot_color, 0.18);
                    if (item.date_day) {
                        iconHtml = '<span class="dash-search-item-icon ic-cal-day" style="background:' + evBg + ';color:' + escHtml(item.dot_color) + '">'
                            + '<span class="dash-search-cal-day">' + escHtml(item.date_day) + '</span>'
                            + '</span>';
                    } else {
                        iconHtml = '<span class="dash-search-item-icon ic-colored" style="background:' + evBg + ';color:' + escHtml(item.dot_color) + '">'
                            + '<i data-lucide="' + escHtml(item.icon) + '"></i>'
                            + '</span>';
                    }
                } else {
                    iconHtml = '<span class="dash-search-item-icon ic-' + escHtml(sec.color) + '">'
                        + '<i data-lucide="' + escHtml(item.icon) + '"></i>'
                        + '</span>';
                }
                var jsaAttr = item.js_action ? ' data-jsa="' + escHtml(item.js_action) + '"' : '';
                var bdgHtml = item.badge ? '<span class="dash-search-item-badge" style="background:' + hexToRgba(item.badge_color||'#475569', 0.15) + ';color:' + escHtml(item.badge_color||'#94a3b8') + '">' + escHtml(item.badge) + '</span>' : '';
                html += '<a class="dash-search-item" href="' + escHtml(item.url)
                    + '"' + jsaAttr + ' style="--si:' + delay + 'ms;--sec-col:' + col + '">'
                    + iconHtml
                    + '<span class="dash-search-item-body">'
                    + '<span class="dash-search-item-title">' + hlText(item.title, q) + bdgHtml + '</span>'
                    + (item.sub ? '<span class="dash-search-item-sub">' + escHtml(item.sub) + '</span>' : '')
                    + '</span>'
                    + '<span class="dash-search-item-arrow"><i data-lucide="corner-down-left"></i></span>'
                    + '</a>';
                delay += 20;
            });
            if (sec.footer) {
                html += '<a class="dash-search-footer" href="' + escHtml(sec.footer.url) + '">'
                    + escHtml(sec.footer.text)
                    + '<i data-lucide="arrow-right"></i>'
                    + '</a>';
            }
            html += '</div>';
        });

        html += '<div class="dash-search-hint" aria-hidden="true">'
            + '<span><kbd>&#8593;&#8595;</kbd>&nbsp;navegar</span>'
            + '<span><kbd>&#9166;</kbd>&nbsp;abrir</span>'
            + '<span><kbd>Esc</kbd>&nbsp;cerrar</span>'
            + '</div>';

        drop.innerHTML = html;
        lucide.createIcons({ nodes: [drop] });
        openDrop();

        _items = Array.from(drop.querySelectorAll('.dash-search-item'));
        _active = -1;
        _items.forEach(function(el) {
            el.addEventListener('click', function(e) {
                if (el.dataset.jsa === 'toggle-theme') {
                    e.preventDefault();
                    var isLight = document.body.classList.toggle('light-mode');
                    try { localStorage.setItem('theme', isLight ? 'light' : 'dark'); } catch(e2) {}
                    if (typeof syncThemeToggle === 'function') syncThemeToggle(true);
                }
                saveRecent(q);
                closeDrop(true);
            });
        });
    }

    // ── fetch ──
    function doSearch(q) {
        if (q.length < 2) { closeDrop(true); return; }
        if (q === _lastQ && _open) return;
        _lastQ = q;
        showLoading();
        fetch('../Dashboard/search.php?q=' + encodeURIComponent(q))
            .then(function(r) { return r.json(); })
            .then(function(d) {
                if (inp.value.trim() !== q) return;
                renderResults(d, q);
            })
            .catch(function() { closeDrop(true); });
    }

    // ── events ──
    inp.addEventListener('focus', function() {
        var q = inp.value.trim();
        if (!q) { showRecent(); return; }
        if (!_open) { _lastQ = ''; doSearch(q); }
    });
    inp.addEventListener('input', function() {
        var q = inp.value.trim();
        if (clrBtn) clrBtn.style.display = q ? '' : 'none';
        clearTimeout(_timer);
        if (!q) { _lastQ = ''; if (getRecent().length) showRecent(); else closeDrop(true); return; }
        _timer = setTimeout(function() { doSearch(q); }, 260);
    });
    inp.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (!_open) { showRecent(); return; }
            setActive(Math.min(_active + 1, _items.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActive(Math.max(_active - 1, -1));
        } else if (e.key === 'Enter') {
            if (_active >= 0 && _items[_active]) {
                e.preventDefault();
                _items[_active].click();
            }
        } else if (e.key === 'Escape') {
            closeDrop();
            if (window.innerWidth <= 480) collapseSearch();
        }
    });

    if (clrBtn) {
        clrBtn.addEventListener('click', function() {
            inp.value = '';
            clrBtn.style.display = 'none';
            _lastQ = '';
            closeDrop(true);
            inp.focus();
        });
    }

    // ── shortcut global: / para buscar ──
    document.addEventListener('keydown', function(e) {
        if (e.key === '/' && document.activeElement !== inp
            && !['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)) {
            e.preventDefault();
            inp.focus();
            if (window.innerWidth <= 480) openSearch();
        }
    });

    function openSearch() {
        if (!outer || outer.classList.contains('open')) return;
        outer.classList.add('open');
        if (topbar) topbar.classList.add('search-open');
        setTimeout(function() { inp && inp.focus(); }, 60);
    }
    function collapseSearch() {
        if (!outer || !outer.classList.contains('open')) return;
        outer.classList.add('closing');
        outer.classList.remove('open');
        setTimeout(function() {
            if (topbar) topbar.classList.remove('search-open');
        }, 50);
        setTimeout(function() { outer.classList.remove('closing'); }, 185);
    }

    // abrir/cerrar search en móvil — se escucha en el wrap (el <i> es reemplazado por Lucide)
    var wrap = document.getElementById('dashSearchWrap');
    if (wrap) {
        wrap.addEventListener('click', function(e) {
            if (window.innerWidth > 480) return;
            if (inp && (e.target === inp || inp.contains(e.target))) return;
            if (e.target.closest('.dash-search-clear')) return;
            if (!outer.classList.contains('open')) openSearch();
        });
    }

    var cancelBtn = document.getElementById('dashSearchCancel');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (inp) { inp.value = ''; }
            if (clrBtn) clrBtn.style.display = 'none';
            _lastQ = '';
            closeDrop(true);
            collapseSearch();
        });
    }

    document.addEventListener('click', function(e) {
        if (!outer || !outer.contains(e.target)) {
            if (window.innerWidth <= 480) collapseSearch();
            closeDrop(true);
        }
    });
})();

// ── notificaciones ──────────────────────────────────────────────
(function() {
    var bellBtn  = document.getElementById('dashBellBtn');
    var badge    = document.getElementById('dashBellBadge');
    var dropdown = document.getElementById('dashNotifDropdown');
    var body     = document.getElementById('dashNotifBody');
    var markBtn  = document.getElementById('dashNotifMark');
    var ctx      = document.getElementById('dashNotifCtx');
    if (!bellBtn || !dropdown) return;

    var _open = false, _closeTimer = null;
    var _prevTotal = -1, _lastTotal = 0, _ringing = false;
    var _lastData = null;
    var _lastSig   = '';
    var _fetching  = false;
    var _noChangeCount = 0;
    var _pollTimer = null;
    var _lastUnseen = -1;
    var _hasRung = false;
    var _testMode = false;

    function _getPollDelay() {
        if (_noChangeCount < 5)  return 6000;
        if (_noChangeCount < 13) return 12000;
        return 25000;
    }
    var SEEN_KEY   = 'nootra_notif_seen';
    var SNOOZE_KEY = 'nootra_notif_snooze';

    function getSeenCount() { try { return parseInt(localStorage.getItem(SEEN_KEY) || '0'); } catch(e) { return 0; } }
    function setSeenCount(n) { try { localStorage.setItem(SEEN_KEY, String(n)); } catch(e) {} }

    function getSnooze() { try { return JSON.parse(localStorage.getItem(SNOOZE_KEY) || '{}'); } catch(e) { return {}; } }
    function setSnooze(obj) { try { localStorage.setItem(SNOOZE_KEY, JSON.stringify(obj)); } catch(e) {} }
    function isSnoozed(key) {
        var s = getSnooze();
        if (!s[key]) return false;
        var expiry = typeof s[key] === 'object' ? s[key].expiry : s[key];
        if (Date.now() > expiry) { delete s[key]; setSnooze(s); return false; }
        return true;
    }
    function snoozeType(key) {
        var s = getSnooze();
        if (!s[key]) return null;
        return typeof s[key] === 'object' ? s[key].type : 'temp';
    }
    function snoozeItem(key, ms, type) {
        var s = getSnooze();
        s[key] = { expiry: Date.now() + ms, type: type || 'temp' };
        setSnooze(s);
    }
    function tomorrowMs() { var d = new Date(); d.setDate(d.getDate() + 1); d.setHours(8, 0, 0, 0); return d.getTime() - Date.now(); }
    function rerenderCached() { if (_lastData) renderNotifs(_lastData); }

    function ringBell() {
        if (_ringing || _open || _hasRung) return;
        _hasRung = true;
        _ringing = true;
        bellBtn.classList.remove('bell-ringing');
        void bellBtn.offsetWidth;
        bellBtn.classList.add('bell-ringing');
        var _fallback = setTimeout(function() {
            bellBtn.classList.remove('bell-ringing');
            _ringing = false;
        }, 600);
        function _onEnd(e) {
            if (e.animationName !== 'dashBellRing') return;
            clearTimeout(_fallback);
            bellBtn.removeEventListener('animationend', _onEnd);
            bellBtn.classList.remove('bell-ringing');
            _ringing = false;
        }
        bellBtn.addEventListener('animationend', _onEnd);
    }
    function stopBellAnim() {
        bellBtn.classList.remove('bell-ringing');
        _ringing = false;
    }

    function updateBadge(total) {
        _lastTotal = total;
        var seen = getSeenCount();
        if (seen > total) { seen = total; setSeenCount(total); }
        var unseen = total - seen;
        if (_open) { setSeenCount(total); _lastUnseen = 0; return; }
        if (unseen > 0) {
            var wasVisible    = badge.classList.contains('visible');
            var countChanged  = unseen !== _lastUnseen;
            badge.textContent = unseen > 9 ? '9+' : unseen;
            if (!wasVisible) {
                badge.classList.add('visible');
            } else if (countChanged) {
                badge.classList.remove('bump');
                void badge.offsetWidth;
                badge.classList.add('bump');
                badge.addEventListener('animationend', function() { badge.classList.remove('bump'); }, { once: true });
            }
            _lastUnseen = unseen;
            bellBtn.classList.add('bell-active');
        } else {
            _lastUnseen = 0;
            if (total === 0) setSeenCount(0);
            badge.classList.remove('visible');
            badge.classList.remove('bump');
            bellBtn.classList.remove('bell-active');
        }
    }

    function renderNotifs(data) {
        var allMsgs = data.messages || [];
        var allEvts = data.events   || [];
        var msgs = allMsgs.filter(function(m)  { return !isSnoozed('msg_' + m.conv_id); });
        var evts = allEvts.filter(function(ev) { return !isSnoozed('ev_'  + ev.id); });
        if (!msgs.length && !evts.length) {
            body.innerHTML = '<div class="dash-notif-empty"><i data-lucide="check-circle-2"></i><span>Todo al día</span></div>';
            lucide.createIcons({ nodes: [body] });
            return;
        }
        var html = '', idx = 0;
        if (msgs.length) {
            html += '<div class="dash-notif-group"><i data-lucide="message-circle"></i>Mensajes</div>';
            msgs.forEach(function(m) {
                var d = (idx * 35) + 'ms';
                html += '<a class="dash-notif-item" href="../messages/messages.php?conv=' + escHtml(String(m.conv_id)) + '" data-notif-type="msg" data-notif-id="' + escHtml(String(m.conv_id)) + '" style="--di:' + d + '">'
                    + '<div class="dash-notif-av" style="background-color:' + escHtml(m.avatar_color) + '">' + escHtml(m.initials) + '</div>'
                    + '<div class="dash-notif-info">'
                    +   '<div class="dash-notif-name">' + escHtml(m.name) + '</div>'
                    +   '<div class="dash-notif-sub">' + (m.unread === 1 ? '1 mensaje nuevo' : m.unread + ' mensajes nuevos') + '</div>'
                    + '</div>'
                    + '<div class="dash-notif-meta">'
                    +   '<span class="dash-notif-time">' + escHtml(m.time_fmt) + '</span>'
                    +   '<span class="dash-notif-count">' + (m.unread > 9 ? '9+' : m.unread) + '</span>'
                    + '</div>'
                    + '<button class="dash-notif-item-menu" aria-label="Opciones"><i data-lucide="more-vertical"></i></button>'
                    + '</a>';
                idx++;
            });
        }
        if (evts.length) {
            if (msgs.length) html += '<div class="dash-notif-divider"></div>';
            html += '<div class="dash-notif-group"><i data-lucide="calendar-days"></i>Calendario</div>';
            evts.forEach(function(ev) {
                var d = (idx * 35) + 'ms';
                var urgCls = ev.is_now ? ' ev-now' : ev.is_soon ? ' ev-soon' : '';
                var evIcon = ev.is_now ? 'alarm-clock' : 'calendar-check';
                var pill   = ev.is_now
                    ? '<span class="dash-notif-pill now">Ahora</span>'
                    : ev.is_soon
                        ? '<span class="dash-notif-pill soon">Pronto</span>'
                        : '';
                var dayLbl = (ev.time_fmt || '').split(' · ')[0];
                var metaHtml = pill
                    ? '<div class="dash-notif-meta">' + pill + '</div>'
                    : '<div class="dash-notif-meta"><span class="dash-notif-ev-when">' + escHtml(dayLbl) + '</span></div>';
                html += '<a class="dash-notif-item ev-item' + urgCls + '" href="../calendar/calendar.php" data-notif-type="ev" data-notif-id="' + escHtml(String(ev.id)) + '" style="--di:' + d + '">'
                    + '<div class="dash-notif-av ev-icon" style="--ev-c:' + escHtml(ev.color) + '">'
                    +   '<i data-lucide="' + evIcon + '"></i>'
                    + '</div>'
                    + '<div class="dash-notif-info">'
                    +   '<div class="dash-notif-name">' + escHtml(ev.title) + '</div>'
                    +   '<div class="dash-notif-sub">' + escHtml(ev.time_fmt) + '</div>'
                    + '</div>'
                    + metaHtml
                    + '<button class="dash-notif-item-menu" aria-label="Opciones"><i data-lucide="more-vertical"></i></button>'
                    + '</a>';
                idx++;
            });
        }
        body.innerHTML = html;
        lucide.createIcons({ nodes: [body] });
    }

    var bellWrap = bellBtn.closest('.dash-bell-wrap') || bellBtn.parentElement;

    function _getOverlay() {
        var ov = document.getElementById('dashNotifOverlay');
        if (!ov) {
            ov = document.createElement('div');
            ov.id = 'dashNotifOverlay';
            ov.className = 'dash-notif-overlay';
            ov.addEventListener('click', function() { closeNotif(); });
            document.body.appendChild(ov);
        }
        return ov;
    }

    function openNotif() {
        if (_closeTimer) {
            clearTimeout(_closeTimer); _closeTimer = null;
            dropdown.classList.remove('closing');
            dropdown.style.display = '';
        }
        if (_open) return;
        _open = true;
        stopBellAnim();
        _hasRung = false;
        dropdown.style.transform = '';
        dropdown.classList.remove('closing');
        dropdown.style.display = '';
        void dropdown.offsetWidth;
        dropdown.classList.add('open');
        bellBtn.classList.add('notif-open');
        bellBtn.setAttribute('aria-expanded', 'true');
        setSeenCount(_lastTotal);
        badge.classList.remove('visible');
        bellBtn.classList.remove('bell-active');
        _noChangeCount = 0;
        if (window.innerWidth <= 480) {
            // mover al body para salir del stacking context del topbar
            if (dropdown.parentElement !== document.body) {
                document.body.appendChild(dropdown);
            }
            var ov = _getOverlay();
            void ov.offsetWidth;
            ov.classList.add('show');
            document.body.classList.add('notif-body-locked');
        }
    }

    function closeNotif() {
        if (!_open) return;
        _open = false;
        dropdown.style.transform = '';
        var ov = document.getElementById('dashNotifOverlay');
        if (ov) ov.classList.remove('show');
        document.body.classList.remove('notif-body-locked');
        if (!_fetching) fetchNotifs(false);
        dropdown.style.display = 'block';
        dropdown.classList.remove('open');
        void dropdown.offsetWidth;
        dropdown.classList.add('closing');
        bellBtn.classList.remove('notif-open');
        bellBtn.setAttribute('aria-expanded', 'false');
        _closeTimer = setTimeout(function() {
            _closeTimer = null;
            dropdown.classList.remove('closing');
            dropdown.style.display = '';
            // devolver al bell-wrap si fue movido al body
            if (dropdown.parentElement === document.body && bellWrap) {
                bellWrap.appendChild(dropdown);
            }
        }, 220);
    }

    function _ownPoll() {
        if (_pollTimer) { clearTimeout(_pollTimer); _pollTimer = null; }
        if (document.hidden) return;
        _pollTimer = setTimeout(function() { _pollTimer = null; fetchNotifs(false); }, _getPollDelay());
    }

    // ── swipe-to-close en bottom sheet (móvil) ───────────────
    var _touchStartY = 0, _touchDelta = 0;
    dropdown.addEventListener('touchstart', function(e) {
        _touchStartY = e.touches[0].clientY;
        _touchDelta = 0;
        dropdown.style.transition = 'transform .0s';
    }, { passive: true });
    dropdown.addEventListener('touchmove', function(e) {
        if (window.innerWidth > 480 || !_open) return;
        if (body.scrollTop > 0) return;
        _touchDelta = e.touches[0].clientY - _touchStartY;
        if (_touchDelta <= 0) return;
        dropdown.style.transform = 'translateY(' + _touchDelta + 'px)';
        var ov = document.getElementById('dashNotifOverlay');
        if (ov) ov.style.opacity = String(Math.max(0, 0.5 - _touchDelta / 240));
    }, { passive: true });
    dropdown.addEventListener('touchend', function() {
        dropdown.style.transition = '';
        if (_touchDelta > 90 && window.innerWidth <= 480) {
            var ov = document.getElementById('dashNotifOverlay');
            if (ov) { ov.style.opacity = ''; }
            dropdown.style.transform = '';
            closeNotif();
        } else {
            dropdown.style.transform = '';
            var ov = document.getElementById('dashNotifOverlay');
            if (ov) ov.style.opacity = '';
        }
        _touchDelta = 0;
    }, { passive: true });

    // cerrar si el usuario rota a landscape y sale del breakpoint de sheet
    window.addEventListener('resize', function() {
        if (_open && window.innerWidth > 480) {
            var ov = document.getElementById('dashNotifOverlay');
            if (ov) { ov.style.opacity = ''; ov.classList.remove('show'); }
            document.body.classList.remove('notif-body-locked');
        }
    });

    function fetchNotifs(forOpen) {
        if (_testMode || _fetching) return;
        _fetching = true;
        fetch('../Dashboard/get_notifications.php')
            .then(function(r) { return r.json(); })
            .then(function(data) {
                _fetching = false;
                if (!data.ok) { _ownPoll(); return; }
                if (data.messages && data.messages.length) {
                    var _s = getSnooze(), _sc = false;
                    data.messages.forEach(function(m) {
                        var k = 'msg_' + m.conv_id;
                        var t = snoozeType(k);
                        if (t === 'temp') { delete _s[k]; _sc = true; }
                    });
                    if (_sc) setSnooze(_s);
                }
                if (_prevTotal >= 0 && data.total > _prevTotal) ringBell();
                _prevTotal = data.total;
                _lastData  = data;
                updateBadge(data.total);
                var sig = data.total + '|'
                    + (data.messages || []).map(function(m) { return m.conv_id + ':' + m.unread; }).join(',')
                    + '|'
                    + (data.events   || []).map(function(ev){ return ev.id + ':' + (ev.is_soon ? 1 : 0) + ':' + (ev.is_now ? 1 : 0); }).join(',');
                var changed = sig !== _lastSig;
                _lastSig = sig;
                if (changed) { _noChangeCount = 0; } else { _noChangeCount++; }
                if (changed || forOpen) renderNotifs(data);
                _ownPoll();
            })
            .catch(function() {
                _fetching = false;
                if (forOpen) {
                    body.innerHTML = '<div class="dash-notif-empty"><i data-lucide="wifi-off"></i><span>Error de conexión</span></div>';
                    lucide.createIcons({ nodes: [body] });
                }
                _ownPoll();
            });
    }

    bellBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (_open) { closeNotif(); return; }
        if (_lastData) {
            renderNotifs(_lastData);
        } else {
            body.innerHTML = '<div class="dash-notif-loading"><i data-lucide="loader-2"></i><span>Cargando...</span></div>';
            lucide.createIcons({ nodes: [body] });
        }
        openNotif();
        if (!_fetching) fetchNotifs(true);
    });

    var _clearing = false;
    if (markBtn) {
        markBtn.addEventListener('click', function() {
            if (_clearing) return;
            _clearing = true;

            setSeenCount(_lastTotal);
            _prevTotal  = _lastTotal;
            _lastUnseen = 0;
            bellBtn.classList.remove('bell-active');
            // vaciamos _lastData para que al reabrir no reaparezcan
            if (_lastData) { _lastData = { ok: true, messages: [], events: [], total: 0 }; }

            // flash botón
            markBtn.classList.remove('mark-flash');
            void markBtn.offsetWidth;
            markBtn.classList.add('mark-flash');
            markBtn.addEventListener('animationend', function h() {
                markBtn.removeEventListener('animationend', h);
                markBtn.classList.remove('mark-flash');
            }, { once: true });

            // badge sale girando
            if (badge.classList.contains('visible')) {
                badge.classList.add('badge-clear');
                var _badgeFallback = setTimeout(function() {
                    badge.classList.remove('visible', 'bump', 'badge-clear');
                }, 350);
                badge.addEventListener('animationend', function h() {
                    badge.removeEventListener('animationend', h);
                    clearTimeout(_badgeFallback);
                    badge.classList.remove('visible', 'bump', 'badge-clear');
                }, { once: true });
            } else {
                badge.classList.remove('visible', 'bump');
            }

            function _showEmpty() {
                body.innerHTML = '<div class="dash-notif-empty"><i data-lucide="check-circle-2"></i><span>Todo al día</span></div>';
                lucide.createIcons({ nodes: [body] });
                _clearing = false;
            }

            // items vuelan fuera con stagger, luego entra el empty state
            var items = body.querySelectorAll('.dash-notif-item');
            if (!items.length) { _showEmpty(); return; }
            var done = 0, total = items.length;
            // fallback por si animationend no dispara (ej: reducción de movimiento)
            var _fallback = setTimeout(function() { _showEmpty(); }, 500 + total * 38);
            items.forEach(function(item, i) {
                item.style.setProperty('--ci', i);
                item.classList.add('clearing');
                item.addEventListener('animationend', function h(e) {
                    if (e.animationName !== 'dashNotifClearItem') return;
                    item.removeEventListener('animationend', h);
                    done++;
                    if (done === total) {
                        clearTimeout(_fallback);
                        _showEmpty();
                    }
                });
            });
        });
    }

    // ── menu contextual de notificaciones ──────────────────────
    function posCtx(x, y) {
        ctx.style.visibility = 'hidden';
        ctx.style.display = 'block';
        var h = ctx.offsetHeight, w = ctx.offsetWidth;
        ctx.style.display = '';
        ctx.style.visibility = '';
        var top = y, left = x;
        if (top + h > window.innerHeight - 8) top = y - h;
        if (left + w > window.innerWidth - 8) left = window.innerWidth - w - 8;
        if (left < 8) left = 8;
        if (top < 8) top = 8;
        ctx.style.top = top + 'px';
        ctx.style.left = left + 'px';
    }

    function closeCtx(cb) {
        if (!ctx || !ctx.classList.contains('show')) { if (cb) cb(); return; }
        ctx.classList.remove('show');
        ctx.classList.add('closing');
        ctx.addEventListener('animationend', function h(e) {
            if (e.target !== ctx) return;
            ctx.removeEventListener('animationend', h);
            ctx.classList.remove('closing');
            if (cb) cb();
        });
        setTimeout(function() {
            if (ctx.classList.contains('closing')) {
                ctx.classList.remove('closing');
                if (cb) cb();
            }
        }, 200);
    }

    function openCtx(x, y, items) {
        if (!ctx) ctx = document.getElementById('dashNotifCtx');
        if (!ctx) return;
        closeCtx(function() {
            var actions = [], html = '';
            items.forEach(function(item) {
                if (item.divider)    { html += '<div class="dash-notif-ctx-divider"></div>'; return; }
                if (item.labelHead)  { html += '<div class="dash-notif-ctx-label">' + escHtml(item.labelHead) + '</div>'; return; }
                var cls = item.cls ? ' ' + item.cls : '';
                html += '<div class="dash-notif-ctx-item' + cls + '" data-idx="' + actions.length + '">';
                if (item.icon) html += '<i data-lucide="' + item.icon + '"></i>';
                html += escHtml(item.label) + '</div>';
                actions.push(item.action || null);
            });
            ctx.innerHTML = html;
            posCtx(x, y);
            ctx.classList.remove('closing');
            ctx.classList.add('show');
            lucide.createIcons({ nodes: [ctx] });
            ctx.querySelectorAll('.dash-notif-ctx-item').forEach(function(el) {
                el.addEventListener('click', function(e) {
                    e.stopPropagation();
                    var idx = parseInt(el.getAttribute('data-idx'));
                    closeCtx(actions[idx] || null);
                });
            });
        });
    }

    function getMsgCtxItems(m) {
        return [
            { icon: 'message-circle', label: 'Ir a conversación', action: function() {
                window.location.href = '../messages/messages.php?conv=' + m.conv_id;
            }},
            { divider: true },
            { icon: 'check', label: 'Marcar como leída', cls: 'success', action: function() {
                var fd = new FormData(); fd.append('conv_id', m.conv_id);
                fetch('../messages/mark_read.php', { method: 'POST', body: fd })
                    .then(function() {
                        rerenderCached();
                        showToast('Conversación marcada como leída', 'success');
                    })
                    .catch(function() { showToast('Error al marcar como leída', 'error'); });
            }},
            { icon: 'bell-off', label: 'Silenciar conversación', action: function() {
                var fd = new FormData(); fd.append('conv_id', m.conv_id); fd.append('type', 'mute');
                fetch('../messages/toggle_conv_meta.php', { method: 'POST', body: fd })
                    .then(function() {
                        snoozeItem('msg_' + m.conv_id, 8 * 3600000, 'mute');
                        rerenderCached();
                        showToast('Conversación silenciada', 'info');
                    })
                    .catch(function() { showToast('Error al silenciar', 'error'); });
            }},
            { divider: true },
            { labelHead: 'Posponer' },
            { icon: 'timer', label: 'En 30 minutos', action: function() {
                snoozeItem('msg_' + m.conv_id, 30 * 60000, 'temp'); rerenderCached(); showToast('Recordatorio en 30 min', 'info');
            }},
            { icon: 'clock', label: 'En 1 hora', action: function() {
                snoozeItem('msg_' + m.conv_id, 3600000, 'temp'); rerenderCached(); showToast('Recordatorio en 1 hora', 'info');
            }},
            { icon: 'calendar-minus', label: 'Hasta mañana', action: function() {
                snoozeItem('msg_' + m.conv_id, tomorrowMs(), 'temp'); rerenderCached(); showToast('Recordatorio para mañana', 'info');
            }},
            { divider: true },
            { icon: 'trash-2', label: 'Eliminar notificación', cls: 'danger', action: function() {
                snoozeItem('msg_' + m.conv_id, 30 * 24 * 3600000, 'dismiss'); rerenderCached(); showToast('Notificación eliminada', 'info');
            }}
        ];
    }

    function getEvCtxItems(ev) {
        return [
            { icon: 'calendar-days', label: 'Ver en calendario', action: function() {
                window.location.href = '../calendar/calendar.php';
            }},
            { divider: true },
            { icon: 'check-circle-2', label: 'Marcar como completado', cls: 'success', action: function() {
                var fd = new FormData(); fd.append('event_id', ev.id); fd.append('done', 1);
                fetch('../calendar/mark_done.php', { method: 'POST', body: fd })
                    .then(function() {
                        snoozeItem('ev_' + ev.id, 365 * 24 * 3600000, 'dismiss');
                        rerenderCached();
                        showToast('Evento completado', 'success');
                    })
                    .catch(function() { showToast('Error al actualizar evento', 'error'); });
            }},
            { divider: true },
            { labelHead: 'Recordar' },
            { icon: 'timer', label: 'En 30 minutos', action: function() {
                snoozeItem('ev_' + ev.id, 30 * 60000, 'temp'); rerenderCached(); showToast('Recordatorio en 30 min', 'info');
            }},
            { icon: 'clock', label: 'En 1 hora', action: function() {
                snoozeItem('ev_' + ev.id, 3600000, 'temp'); rerenderCached(); showToast('Recordatorio en 1 hora', 'info');
            }},
            { icon: 'calendar-x', label: 'Mañana por la mañana', action: function() {
                snoozeItem('ev_' + ev.id, tomorrowMs(), 'temp'); rerenderCached(); showToast('Recordatorio para mañana', 'info');
            }},
            { divider: true },
            { icon: 'trash-2', label: 'Eliminar notificación', cls: 'danger', action: function() {
                snoozeItem('ev_' + ev.id, 30 * 24 * 3600000, 'dismiss'); rerenderCached(); showToast('Notificación eliminada', 'info');
            }}
        ];
    }

    body.addEventListener('contextmenu', function(e) {
        var item = e.target.closest('.dash-notif-item');
        if (!item) return;
        e.preventDefault();
        e.stopPropagation();
        if (!_lastData) return;
        var type = item.getAttribute('data-notif-type');
        var id   = item.getAttribute('data-notif-id');
        if (!type || !id) return;
        var items;
        if (type === 'msg') {
            var m = null;
            (_lastData.messages || []).forEach(function(x) { if (String(x.conv_id) === id) m = x; });
            if (!m) return;
            items = getMsgCtxItems(m);
        } else {
            var ev = null;
            (_lastData.events || []).forEach(function(x) { if (String(x.id) === id) ev = x; });
            if (!ev) return;
            items = getEvCtxItems(ev);
        }
        openCtx(e.clientX, e.clientY, items);
    });

    body.addEventListener('click', function(e) {
        var btn = e.target.closest('.dash-notif-item-menu');
        if (!btn) return;
        e.preventDefault(); e.stopPropagation();
        var item = btn.closest('.dash-notif-item');
        if (!item || !_lastData) return;
        var type = item.getAttribute('data-notif-type');
        var id   = item.getAttribute('data-notif-id');
        if (!type || !id) return;
        var ctxItems;
        if (type === 'msg') {
            var mm = null;
            (_lastData.messages || []).forEach(function(x) { if (String(x.conv_id) === id) mm = x; });
            if (!mm) return;
            ctxItems = getMsgCtxItems(mm);
        } else {
            var evv = null;
            (_lastData.events || []).forEach(function(x) { if (String(x.id) === id) evv = x; });
            if (!evv) return;
            ctxItems = getEvCtxItems(evv);
        }
        var r = btn.getBoundingClientRect();
        openCtx(r.right, r.bottom + 4, ctxItems);
    });

    document.addEventListener('click', function(e) {
        if (ctx && ctx.classList.contains('show') && !ctx.contains(e.target)) closeCtx();
        if (_open && !dropdown.contains(e.target) && !bellBtn.contains(e.target)) closeNotif();
    });
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (ctx && ctx.classList.contains('show')) { closeCtx(); return; }
            if (_open) { closeNotif(); bellBtn.focus(); }
        }
    });

    var _testMsgStep = 0, _testCalStep = 0;
    var _msgSteps = [
        { conv_id: 1, name: 'Ana García',    unread: 3, avatar_color: '#7c3aed', initials: 'AG', time_fmt: '2m'   },
        { conv_id: 2, name: 'Carlos López',  unread: 1, avatar_color: '#ec4899', initials: 'CL', time_fmt: '15m'  },
        { conv_id: 3, name: 'Sofía Martínez',unread: 9, avatar_color: '#0ea5e9', initials: 'SM', time_fmt: 'ahora'}
    ];
    var _calSteps = [
        { id: 10, title: 'Entrega de proyecto',  color: '#ef4444', time_fmt: 'Hoy · 14:00',     is_soon: false, is_now: true  },
        { id: 11, title: 'Reunión de equipo',    color: '#10b981', time_fmt: 'Hoy · 18:30',     is_soon: true,  is_now: false },
        { id: 12, title: 'Clase de matemáticas', color: '#f59e0b', time_fmt: 'Mañana · 09:00',  is_soon: false, is_now: false },
        { id: 13, title: 'Defensa del proyecto', color: '#6366f1', time_fmt: 'Hoy · 16:00',     is_soon: true,  is_now: false }
    ];

    function _injectTest(d) {
        d.ok = true;
        _testMode  = true;
        var _s = getSnooze(), _sc = false;
        (d.messages || []).forEach(function(m)  { if (_s['msg_' + m.conv_id]) { delete _s['msg_' + m.conv_id]; _sc = true; } });
        (d.events   || []).forEach(function(ev) { if (_s['ev_'  + ev.id])     { delete _s['ev_'  + ev.id];     _sc = true; } });
        if (_sc) setSnooze(_s);
        _hasRung   = false;
        _lastSig   = '';
        _prevTotal = Math.max(0, (_lastData ? _lastData.total || 0 : 0));
        _lastData  = d;
        updateBadge(d.total);
        if (d.total > _prevTotal) ringBell();
        _prevTotal = d.total;
        renderNotifs(d);
        if (!_open) openNotif();
        if (_pollTimer) { clearTimeout(_pollTimer); _pollTimer = null; }
    }

    window.__notifTestMsg = function() {
        var base = _lastData ? { messages: (_lastData.messages || []).slice(), events: (_lastData.events || []) } : { messages: [], events: [] };
        var m = _msgSteps[_testMsgStep % _msgSteps.length];
        _testMsgStep++;
        var existing = base.messages.filter(function(x) { return x.conv_id !== m.conv_id; });
        existing.push(m);
        var total = existing.reduce(function(s, x) { return s + x.unread; }, 0) + base.events.length;
        _injectTest({ messages: existing, events: base.events, total: total });
    };

    window.__notifTestCal = function() {
        var base = _lastData ? { messages: (_lastData.messages || []), events: (_lastData.events || []).slice() } : { messages: [], events: [] };
        var ev = _calSteps[_testCalStep % _calSteps.length];
        _testCalStep++;
        var existing = base.events.filter(function(x) { return x.id !== ev.id; });
        existing.push(ev);
        var total = (base.messages || []).reduce(function(s, x) { return s + x.unread; }, 0) + existing.length;
        _injectTest({ messages: base.messages, events: existing, total: total });
    };

    var testMsgBtn = document.getElementById('dashTestNotifMsg');
    var testCalBtn = document.getElementById('dashTestNotifCal');
    if (testMsgBtn) testMsgBtn.addEventListener('click', function(e) { e.stopPropagation(); window.__notifTestMsg(); });
    if (testCalBtn) testCalBtn.addEventListener('click', function(e) { e.stopPropagation(); window.__notifTestCal(); });

    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            if (_pollTimer) { clearTimeout(_pollTimer); _pollTimer = null; }
        } else {
            _noChangeCount = 0;
            fetchNotifs(false);
        }
    });

    var _syncDebounce = null;
    window._notifSync = function() {
        if (_syncDebounce) return;
        _syncDebounce = setTimeout(function() {
            _syncDebounce = null;
            if (_pollTimer) { clearTimeout(_pollTimer); _pollTimer = null; }
            _noChangeCount = 0;
            if (!_fetching) fetchNotifs(false);
        }, 800);
    };

    fetchNotifs(false);
})();
