<section class="dash-stats">
  <div class="dash-stat" id="statMessages" style="--sd:.05s" data-module="../messages/messages.php">
    <div class="dash-stat-icon red"><i data-lucide="message-circle"></i></div>
    <div class="dash-stat-body">
      <span class="dash-stat-lbl">Mensajes sin leer</span>
      <span class="dash-stat-num dash-stat-loading" id="statMsgNum">—</span>
    </div>
    <a class="dash-stat-go" href="../messages/messages.php" aria-label="Ir a mensajes"><i data-lucide="arrow-up-right"></i></a>
  </div>
  <div class="dash-stat" id="statEvents" style="--sd:.10s" data-module="../calendar/calendar.php">
    <div class="dash-stat-icon teal"><i data-lucide="calendar"></i></div>
    <div class="dash-stat-body">
      <span class="dash-stat-lbl">Eventos de hoy</span>
      <span class="dash-stat-num dash-stat-loading" id="statEvtNum">—</span>
    </div>
    <a class="dash-stat-go" href="../calendar/calendar.php" aria-label="Ir al calendario"><i data-lucide="arrow-up-right"></i></a>
  </div>
  <div class="dash-stat" id="statTasks" style="--sd:.15s" data-module="../task/index.php">
    <div class="dash-stat-icon amber"><i data-lucide="alert-circle"></i></div>
    <div class="dash-stat-body">
      <span class="dash-stat-lbl">Tareas pendientes</span>
      <span class="dash-stat-num dash-stat-loading" id="statTaskNum">—</span>
    </div>
    <a class="dash-stat-go" href="../task/index.php" aria-label="Ir a tareas"><i data-lucide="arrow-up-right"></i></a>
  </div>
  <div class="dash-stat" id="statNotes" style="--sd:.20s" data-module="../Books/Books.php">
    <div class="dash-stat-icon purple"><i data-lucide="notebook-pen"></i></div>
    <div class="dash-stat-body">
      <span class="dash-stat-lbl">Notas esta semana</span>
      <span class="dash-stat-num dash-stat-loading" id="statNoteNum">—</span>
    </div>
    <a class="dash-stat-go" href="../Books/Books.php" aria-label="Ir a cuadernos"><i data-lucide="arrow-up-right"></i></a>
  </div>
</section>
<script>
(function() {
    var colorRgb = {
        blue:'59,130,246', red:'239,68,68',   cyan:'6,182,212',
        teal:'20,184,166', orange:'249,115,22',amber:'245,158,11',
        green:'16,185,129',indigo:'99,102,241',purple:'124,58,237',
        pink:'236,72,153',
    };
    var statGroups = [
        { stats:[
            {icon:'message-circle', lbl:'Mensajes sin leer',    numId:'statMsgNum',   color:'red',    key:'msg_unread'     },
            {icon:'send',           lbl:'Enviados hoy',          numId:'statSentNum',  color:'blue',   key:'msg_sent'       },
            {icon:'inbox',          lbl:'Conversaciones',        numId:'statConvNum',  color:'cyan',   key:'conv_active'    },
        ]},
        { stats:[
            {icon:'calendar',       lbl:'Eventos de hoy',        numId:'statEvtNum',   color:'teal',   key:'events_today'   },
            {icon:'calendar-clock', lbl:'Próximas entregas',     numId:'statEvtDNum',  color:'orange', key:'events_deadline'},
            {icon:'calendar-check', lbl:'Eventos esta semana',   numId:'statEvtWNum',  color:'amber',  key:'events_week'    },
        ]},
        { stats:[
            {icon:'alert-circle',   lbl:'Tareas pendientes',     numId:'statTaskNum',  color:'amber',  key:'tasks_pending'  },
            {icon:'circle-check',   lbl:'Completadas',           numId:'statDoneNum',  color:'green',  key:'tasks_done'     },
            {icon:'calendar-check', lbl:'Eventos esta semana',   numId:'statWipNum',   color:'indigo', key:'events_week'    },
        ]},
        { stats:[
            {icon:'notebook-pen',   lbl:'Notas esta semana',     numId:'statNoteNum',  color:'purple', key:'notes_week'     },
            {icon:'book-open',      lbl:'Notas totales',         numId:'statTotalNum', color:'indigo', key:'notes_total'    },
            {icon:'bookmark',       lbl:'Guardadas',             numId:'statBkmNum',   color:'pink',   key:'bookmarks'      },
        ]},
    ];
    var slots   = ['statMessages','statEvents','statTasks','statNotes'];
    var current = statGroups.map(function(g){ return Math.floor(Math.random()*g.stats.length); });
    var cache   = {};

    function animateNum(el, target) {
        el.classList.remove('dash-stat-loading');
        var dur = 580, t0 = null;
        (function tick(ts) {
            if (!t0) t0 = ts;
            var p = Math.min((ts-t0)/dur, 1);
            el.textContent = Math.round((1-Math.pow(1-p,3))*target);
            if (p < 1) requestAnimationFrame(tick);
        })(performance.now());
    }

    slots.forEach(function(id, i) {
        var card = document.getElementById(id);
        if (!card) return;
        var s   = statGroups[i].stats[current[i]];
        var iEl = card.querySelector('.dash-stat-icon i');
        var iWr = card.querySelector('.dash-stat-icon');
        var lEl = card.querySelector('.dash-stat-lbl');
        var nEl = card.querySelector('.dash-stat-num');
        if (iEl) iEl.setAttribute('data-lucide', s.icon);
        if (lEl) lEl.textContent = s.lbl;
        if (nEl) { nEl.id = s.numId; nEl.classList.add('dash-stat-loading'); }
        if (iWr) iWr.className = 'dash-stat-icon '+s.color;
        card.style.setProperty('--card-rgb', colorRgb[s.color]||'124,58,237');
    });

    function swapStat(i) {
        var card = document.getElementById(slots[i]);
        if (!card) return;
        var body = card.querySelector('.dash-stat-body');
        var iWr  = card.querySelector('.dash-stat-icon');
        current[i] = (current[i]+1) % statGroups[i].stats.length;
        var s = statGroups[i].stats[current[i]];
        body.classList.add('stat-out');
        if (iWr) { iWr.classList.remove('icon-in'); iWr.classList.add('icon-out'); }
        setTimeout(function() {
            var lEl = card.querySelector('.dash-stat-lbl');
            var nEl = card.querySelector('.dash-stat-num');
            if (iWr) {
                iWr.innerHTML = '<i data-lucide="'+s.icon+'"></i>';
                iWr.className = 'dash-stat-icon '+s.color+' icon-in';
            }
            if (lEl) lEl.textContent = s.lbl;
            if (nEl) {
                nEl.id = s.numId;
                var val = cache[s.key];
                nEl.textContent = '—';
                nEl.classList.add('dash-stat-loading');
                if (val !== undefined) {
                    setTimeout(function() { animateNum(nEl, val); }, 80);
                }
            }
            card.style.setProperty('--card-rgb', colorRgb[s.color]||'124,58,237');
            lucide.createIcons();
            body.classList.remove('stat-out');
            body.classList.add('stat-in');
            setTimeout(function() {
                body.classList.remove('stat-in');
                if (iWr) iWr.classList.remove('icon-in');
            }, 340);
        }, 155);
    }

    slots.forEach(function(_,i){
        setTimeout(function(){ setInterval(function(){ swapStat(i); }, 7000); }, 3000+i*1800);
    });

    var _sfetch = window._dashPrefetch
        ? window._dashPrefetch.then(function(d){ return d.stats || {}; })
        : fetch('../Dashboard/get_stats.php').then(function(r){ return r.json(); });
    _sfetch.then(function(data) {
            cache = data;
            slots.forEach(function(_, i) {
                var s   = statGroups[i].stats[current[i]];
                var nEl = document.getElementById(s.numId);
                if (nEl && data[s.key] !== undefined) animateNum(nEl, data[s.key]);
            });
        })
        .catch(function(){
            document.querySelectorAll('.dash-stat-loading').forEach(function(el){
                el.textContent='0'; el.classList.remove('dash-stat-loading');
            });
        });
})();
</script>
