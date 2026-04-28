<article class="ia-card">
    <header class="ia-header">
        <div class="ia-title-block">
            <h1>Nootra IA</h1>
            <p id="ia-mode-label" class="ia-mode-label">Modo: General</p>
        </div>
        <div class="ia-actions">
            <button type="button" id="ia-new-chat" class="ia-new-chat-btn" title="Nueva conversacion">Nuevo</button>
            <div class="ia-change-wrap">
                <button type="button" id="ia-change-btn" class="ia-mode-toggle" aria-expanded="false" aria-controls="ia-change-menu" title="Cambiar modo">
                    <span id="ia-selected-mode">General</span>
                    <span aria-hidden="true">v</span>
                </button>
                <div id="ia-change-menu" class="ia-change-menu" hidden>
                    <button type="button" class="ia-change-option" data-mode="general">General</button>
                    <button type="button" class="ia-change-option" data-mode="resumen">Resumen</button>
                    <button type="button" class="ia-change-option" data-mode="ideas">Ideas</button>
                    <button type="button" class="ia-change-option" data-mode="cuestionario">Cuestionario</button>
                </div>
            </div>
            <button type="button" id="ia-close-btn" class="ia-icon-btn" title="Cerrar">X</button>
        </div>
    </header>

    <section id="ia-chat" class="ia-chat" aria-live="polite">
        <div class="ia-message ia-assistant">
            Hola, puedo ayudarte a aclarar conceptos o resumir tu nota.
        </div>
    </section>

    <form id="ia-form" class="ia-form" autocomplete="off">
        <textarea
            id="ia-prompt"
            name="prompt"
            rows="2"
            maxlength="1000"
            placeholder="Escribe tu mensaje..."
            required
        ></textarea>
        <button type="submit" id="ia-submit">Enviar</button>
    </form>
    <p id="ia-status" class="ia-status" aria-live="polite"></p>
</article>