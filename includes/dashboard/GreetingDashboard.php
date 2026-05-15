<section class="dash-greeting">
  <div class="dash-greet-left">
    <h2 class="dash-greet-h">¡<span id="dashGreetWord">Hola</span>, <span class="dash-greet-name" id="dashGreetName">Usuario</span>!</h2>
    <p class="dash-greet-sub" id="dashGreetSub"></p>
  </div>
</section>
<script>
(function() {
    var name  = <?= json_encode($_SESSION['user']['username'] ?? 'Usuario') ?>;
    var nameEl = document.getElementById('dashGreetName');
    var wordEl = document.getElementById('dashGreetWord');
    var subEl  = document.getElementById('dashGreetSub');
    if (nameEl) nameEl.textContent = name;

    var h = new Date().getHours(), pool;
    if (h < 6) {
        pool = [
            ['Buenas noches',  'Todavía en pie — el silencio es tuyo a esta hora'],
            ['Buenas noches',  'La madrugada te pertenece — aprovecha la calma'],
            ['Trasnochando',   'Nadie más despierto, solo tú y tus pendientes'],
            ['Aún de pie',     'La madrugada tiene su magia — ¿qué estás construyendo?'],
        ];
    } else if (h < 12) {
        pool = [
            ['Buenos días',   'Empieza bien el día — revisa tus tareas pendientes'],
            ['Buenos días',   '¿Listo para lo que viene hoy?'],
            ['Buenos días',   'Mañana despejada, mente fresca — a por ello'],
            ['Buenos días',   'El día es tuyo — ¿qué harás primero?'],
            ['Buenos días',   'Hoy puede ser un gran día — depende de ti'],
            ['Buenos días',   'Café en mano y a conquistar el día'],
        ];
    } else if (h < 14) {
        pool = [
            ['Buen mediodía', 'Ya llegaste a la mitad del día — ¿cómo vas?'],
            ['Buen mediodía', 'Pausa, respira — ya vas a la mitad'],
            ['Buen mediodía', 'Momento perfecto para revisar tu progreso'],
            ['Buen mediodía', 'Mitad del día, mitad del camino'],
        ];
    } else if (h < 19) {
        pool = [
            ['Buenas tardes', '¿Cómo va el día? Tus datos te esperan abajo'],
            ['Buenas tardes', 'La tarde avanza — sigue así, vas bien'],
            ['Buenas tardes', 'Quedan pocas horas — úsalas bien'],
            ['Buenas tardes', 'Tarde productiva por delante — a terminar fuerte'],
            ['Buenas tardes', 'Ya casi terminas el día, ánimo'],
        ];
    } else {
        pool = [
            ['Buenas noches', 'Aquí tienes tu resumen del día'],
            ['Buenas noches', 'Terminando el día — revisa cómo te fue'],
            ['Buenas noches', 'Último repaso antes de cerrar el día'],
            ['Buenas noches', 'El día fue largo — pero lo lograste'],
        ];
    }

    var pick = pool[Math.floor(Math.random() * pool.length)];
    if (wordEl) wordEl.textContent = pick[0];
    if (subEl)  subEl.textContent  = pick[1];
})();
</script>
