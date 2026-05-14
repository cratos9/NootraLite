<div class="dash-card" style="--sd:.32s">
  <div class="dash-card-head">
    <span class="dash-card-title"><i data-lucide="zap"></i> Accesos rápidos</span>
  </div>
  <div class="dash-quick-links" id="dashQuickLinks"></div>
</div>
<script>
(function() {
    var defs = [
        {key:'messages', href:'../messages/messages.php', icon:'message-circle', name:'Mensajes',   qc:'59,130,246', qct:'#60a5fa'},
        {key:'calendar', href:'../calendar/calendar.php', icon:'calendar',       name:'Calendario', qc:'20,184,166', qct:'#2dd4bf'},
        {key:'books',    href:'../Books/Books.php',        icon:'book-open',      name:'Cuadernos',  qc:'124,58,237', qct:'#a78bfa'},
        {key:'tasks',    href:'../task/index.php',         icon:'check-square',   name:'Tareas',     qc:'245,158,11', qct:'#fbbf24'},
    ];

    function getFreq() {
        try { return JSON.parse(localStorage.getItem('nootra_ql')||'{}'); } catch(e){ return {}; }
    }

    var freq   = getFreq();
    var sorted = defs.map(function(l,i){ return {l:l,i:i}; })
        .sort(function(a,b){
            var d = (freq[b.l.key]||0)-(freq[a.l.key]||0);
            return d ? d : a.i-b.i;
        });

    var wrap = document.getElementById('dashQuickLinks');
    if (!wrap) return;
    sorted.forEach(function(item, pos) {
        var l   = item.l;
        var top = pos===0 && (freq[l.key]||0)>=3;
        var a   = document.createElement('a');
        a.className = 'dash-quick-row';
        a.href = l.href;
        a.setAttribute('data-key', l.key);
        a.style.cssText = '--qc:'+l.qc+';--qct:'+l.qct;
        a.style.animation = 'dashFadeUp .28s cubic-bezier(.34,1.56,.64,1) '+(pos*.055)+'s both';
        a.innerHTML =
            '<span class="dash-quick-icon"><i data-lucide="'+l.icon+'"></i></span>'+
            '<span class="dash-quick-name">'+l.name+'</span>'+
            (top?'<span class="dash-quick-badge">frecuente</span>':'')+
            '<i data-lucide="chevron-right" class="dash-quick-arr"></i>';
        a.addEventListener('click', function(){
            var f = getFreq();
            f[l.key] = (f[l.key]||0)+1;
            try { localStorage.setItem('nootra_ql', JSON.stringify(f)); } catch(e){}
        });
        wrap.appendChild(a);
    });
    lucide.createIcons();
})();
</script>
