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
        lucide.createIcons();
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
                lucide.createIcons();
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
                lucide.createIcons();
                return;
            }

            var html = '';
            res.conversations.forEach(function(c, i) { html += buildMsgRow(c, i); });
            list.innerHTML = html;
            lucide.createIcons();
            applyPrivacyState();

            _dashMsgCache = res.conversations;
            _startPoll();
        })
        .catch(function() {
            var list = document.getElementById('dashMsgList');
            if (list) {
                list.innerHTML = '<div class="dash-msg-empty"><i data-lucide="wifi-off"></i><span>No se pudo cargar</span></div>';
                lucide.createIcons();
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
            if (window.innerWidth <= 480 && outer) outer.classList.add('open');
        }
    });

    // abrir en móvil al click del ícono
    var iconBtn = document.getElementById('dashSearchIconBtn');
    if (iconBtn) {
        iconBtn.addEventListener('click', function() {
            if (window.innerWidth <= 480) {
                outer.classList.toggle('open');
                if (outer.classList.contains('open')) setTimeout(function() { inp.focus(); }, 80);
            }
        });
    }

    document.addEventListener('click', function(e) {
        if (!outer || !outer.contains(e.target)) {
            if (window.innerWidth <= 480 && outer) outer.classList.remove('open');
            closeDrop(true);
        }
    });
})();
