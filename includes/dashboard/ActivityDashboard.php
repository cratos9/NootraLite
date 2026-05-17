<div class="dash-card" id="dashActivityCard" style="--sd:.28s">
  <div class="dash-card-head">
    <span class="dash-card-title"><span class="dash-head-icon purple"><i data-lucide="bar-chart-2"></i></span> Actividad semanal</span>
    <span class="dash-card-meta" id="dashActivityMeta">esta semana</span>
  </div>
  <div class="dash-chart-area">
    <div class="dash-chart-bars-stub" id="dashChartBars">
      <div class="dash-guide" style="--gp:33%"></div>
      <div class="dash-guide" style="--gp:66%"></div>
      <div class="dash-bar-s" style="--h:4%;--bd:.05s"></div>
      <div class="dash-bar-s" style="--h:4%;--bd:.10s"></div>
      <div class="dash-bar-s" style="--h:4%;--bd:.15s"></div>
      <div class="dash-bar-s" style="--h:4%;--bd:.20s"></div>
      <div class="dash-bar-s" style="--h:4%;--bd:.25s"></div>
      <div class="dash-bar-s" style="--h:4%;--bd:.30s"></div>
      <div class="dash-bar-s" style="--h:4%;--bd:.35s"></div>
    </div>
    <div class="dash-chart-days">
      <span class="dash-chart-day">Lu</span>
      <span class="dash-chart-day">Ma</span>
      <span class="dash-chart-day">Mi</span>
      <span class="dash-chart-day">Ju</span>
      <span class="dash-chart-day">Vi</span>
      <span class="dash-chart-day">Sá</span>
      <span class="dash-chart-day">Do</span>
    </div>
  </div>
</div>
<script>
(function() {
    var map  = [6,0,1,2,3,4,5];
    var idx  = map[new Date().getDay()];
    var lbls = document.querySelectorAll('.dash-chart-day');
    var bars = document.querySelectorAll('#dashChartBars .dash-bar-s');
    if (lbls[idx]) lbls[idx].classList.add('today');
    if (bars[idx]) bars[idx].classList.add('today');
    if (!bars.length) return;

    var dayNames = ['Lu','Ma','Mi','Ju','Vi','Sá','Do'];
    var _afetch = window._dashPrefetch
        ? window._dashPrefetch.then(function(d){ return d.activity || {counts:[],max:1}; })
        : fetch('../Dashboard/get_activity.php').then(function(r){ return r.json(); });
    _afetch.then(function(data) {
            var counts = data.counts || [0,0,0,0,0,0,0];
            var max    = data.max || 1;
            var total  = counts.reduce(function(a,b){ return a+b; }, 0);
            var meta   = document.getElementById('dashActivityMeta');
            if (meta) meta.textContent = total+' acciones esta semana';
            bars.forEach(function(bar, i) {
                var pct = Math.max(Math.round((counts[i]/max)*100), 4);
                bar.setAttribute('data-count', dayNames[i]+': '+counts[i]);
                bar.style.height = pct+'%';
            });
        })
        .catch(function(){});
})();
</script>
