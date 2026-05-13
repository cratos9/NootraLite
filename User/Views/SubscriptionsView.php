<?php include '../includes/sidebar.php'; ?>
<!DOCTYPE html>
<html lang="es-MX">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
    <script src="../js/includes/lightMode.js" defer></script>
    <script src="../js/includes/toast.js"></script>
    <link rel="stylesheet" href="../css/includes/toast.css">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../css/includes/sidebar.css">
    <link rel="stylesheet" href="../css/User/Subscriptions.css">
    <link rel="stylesheet" href="../css/includes/lightMode.css">
    <title>Subscripciones</title>
</head>
<body>
    <aside class="type">
        <button class="plan-type individual-nav active" onClick="changePlan('individual')">Individual</button>
        <button class="plan-type education-nav" onClick="changePlan('education')">Educación</button>
        <button class="plan-type enterprise-nav" onClick="changePlan('enterprise')">Empresarial</button>
    </aside>
    <main class="main">
        <article class="subscription">
            <h2 class="subscription-title_free">Gratis</h2>
            <section class="price">
                <i data-lucide="dollar-sign" class="price-icon"></i>
                <p class="price-amount_free">0 <span>MXN/mes</span></p>
            </section>
            <section class="change">
                <?php
                    if ($subscription['plan_type'] === 'free' && $subscription['subscription_category'] === 'individual') {
                        echo '<span class="current-plan individual">Plan actual</span>';
                    } else {
                        echo '<a href="../User/Subscriptions.php?action=cancelIndividualSubscription" class="change-link individual" id="cancelSubscriptionTrigger">Cancelar suscripción</a>';
                    }

                    if ($subscription['plan_type'] === 'free' && $subscription['subscription_category'] === 'enterprise') {
                        echo '<span class="current-plan enterprise hidden">Plan actual</span>';
                    } else {
                        echo '<a href="../User/PayFake.php?plan=free&category=enterprise" class="change-link enterprise hidden" disabled >Cambiar a Basica empresarial</a>';
                    }

                    if ($subscription['plan_type'] === 'free' && $subscription['subscription_category'] === 'education') {
                        echo '<span class="current-plan education hidden">Plan actual</span>';
                    } else {
                        echo '<a href="../User/PayFake.php?plan=free&category=education" class="change-link education hidden" disabled >Cambiar a Basica educacion</a>';
                    }
                ?>
            </section>
            
            <section class="features">
                <p class="feature"><i data-lucide="sparkle"></i>Modelos basicos</p>
                <p class="feature individual"><i data-lucide="messages-square"></i>Limite de 100 consultas mensuales</p>
                <p class="feature enterprise hidden"><i data-lucide="messages-square"></i>Limite de 1000 consultas mensuales</p>
                <p class="feature education hidden"><i data-lucide="messages-square"></i>Limite de 500 consultas mensuales</p>
                <p class="feature individual"><i data-lucide="book"></i>Hasta 10 libros</p>
                <p class="feature enterprise hidden"><i data-lucide="book"></i>Hasta 100 libros</p>
                <p class="feature education hidden"><i data-lucide="book"></i>Hasta 50 libros</p>
                <p class="feature individual"><i data-lucide="notepad-text"></i>Hasta 20 notas por libro</p>
                <p class="feature enterprise hidden"><i data-lucide="notepad-text"></i>Hasta 200 notas por libro</p>
                <p class="feature education hidden"><i data-lucide="notepad-text"></i>Hasta 100 notas por libro</p>
                <p class="feature individual"><i data-lucide="paperclip"></i>Hasta 5 archivos adjuntos por nota</p>
                <p class="feature enterprise hidden"><i data-lucide="paperclip"></i>Hasta 50 archivos adjuntos por nota</p>
                <p class="feature education hidden"><i data-lucide="paperclip"></i>Hasta 20 archivos adjuntos por nota</p>
            </section>
        </article>
        <article class="subscription pro">
            <h2>Pro</h2>
            <section class="price">
                <i data-lucide="dollar-sign" class="price-icon"></i>
                <p class="price-amount_pro">150 <span>MXN/mes</span></p>
            </section>
            <section class="change">
                <?php
                    if ($subscription['plan_type'] === 'pro' && $subscription['subscription_category'] === 'individual') {
                        echo '<span class="current-plan individual">Plan actual</span>';
                    } else {
                        echo '<a href="../User/PayFake.php?plan=pro&category=individual" class="change-link individual" disabled >Cambiar a Pro</a>';
                    }

                    if ($subscription['plan_type'] === 'pro' && $subscription['subscription_category'] === 'enterprise') {
                        echo '<span class="current-plan enterprise hidden">Plan actual</span>';
                    } else {
                        echo '<a href="../User/PayFake.php?plan=pro&category=enterprise" class="change-link enterprise hidden" disabled >Cambiar a Pro empresarial</a>';
                    }

                    if ($subscription['plan_type'] === 'pro' && $subscription['subscription_category'] === 'education') {
                        echo '<span class="current-plan education hidden">Plan actual</span>';
                    } else {
                        echo '<a href="../User/PayFake.php?plan=pro&category=education" class="change-link education hidden" disabled >Cambiar a Pro educacion</a>';
                    }
                ?>
            </section>
            <section class="features">
                <p class="feature"><i data-lucide="sparkle"></i>Modelos avanzados</p>
                <p class="feature individual"><i data-lucide="messages-square"></i>Limite de 200 consultas mensuales</p>
                <p class="feature enterprise hidden"><i data-lucide="messages-square"></i>Limite de 2000 consultas mensuales</p>
                <p class="feature education hidden"><i data-lucide="messages-square"></i>Limite de 1000 consultas mensuales</p>
                <p class="feature individual"><i data-lucide="book"></i>Hasta 20 libros</p>
                <p class="feature enterprise hidden"><i data-lucide="book"></i>Hasta 200 libros</p>
                <p class="feature education hidden"><i data-lucide="book"></i>Hasta 100 libros</p>
                <p class="feature individual"><i data-lucide="notepad-text"></i>Hasta 40 notas por libro</p>
                <p class="feature enterprise hidden"><i data-lucide="notepad-text"></i>Hasta 400 notas por libro</p>
                <p class="feature education hidden"><i data-lucide="notepad-text"></i>Hasta 200 notas por libro</p>
                <p class="feature individual"><i data-lucide="paperclip"></i>Hasta 10 archivos adjuntos por nota</p>
                <p class="feature enterprise hidden"><i data-lucide="paperclip"></i>Hasta 100 archivos adjuntos por nota</p>
                <p class="feature education hidden"><i data-lucide="paperclip"></i>Hasta 50 archivos adjuntos por nota</p>
            </section>
        </article>
        <article class="subscription mega">
            <h2>Mega <span class="message">Mejor plan</span></h2>
            <section class="price">
                <i data-lucide="dollar-sign" class="price-icon"></i>
                <p class="price-amount_mega">200 <span>MXN/mes</span></p>
            </section>
            <section class="change">
                <?php
                    if ($subscription['plan_type'] === 'mega' && $subscription['subscription_category'] === 'individual') {
                        echo '<span class="current-plan individual">Plan actual</span>';
                    } else {
                        echo '<a href="../User/PayFake.php?plan=mega&category=individual" class="change-link individual" disabled >Cambiar a Mega</a>';
                    }

                    if ($subscription['plan_type'] === 'mega' && $subscription['subscription_category'] === 'enterprise') {
                        echo '<span class="current-plan enterprise hidden">Plan actual</span>';
                    } else {
                        echo '<a href="../User/PayFake.php?plan=mega&category=enterprise" class="change-link enterprise hidden" disabled >Cambiar a Mega empresarial</a>';
                    }

                    if ($subscription['plan_type'] === 'mega' && $subscription['subscription_category'] === 'education') {
                        echo '<span class="current-plan education hidden">Plan actual</span>';
                    } else {
                        echo '<a href="../User/PayFake.php?plan=mega&category=education" class="change-link education hidden" disabled >Cambiar a Mega educacion</a>';
                    }
                ?>
            </section>
            <section class="features">
                <p class="feature"><i data-lucide="sparkle"></i>Modelos avanzados</p>
                <p class="feature individual"><i data-lucide="messages-square"></i>Limite de 500 consultas mensuales</p>
                <p class="feature enterprise hidden"><i data-lucide="messages-square"></i>Limite de 5000 consultas mensuales</p>
                <p class="feature education hidden"><i data-lucide="messages-square"></i>Limite de 2000 consultas mensuales</p>
                <p class="feature individual"><i data-lucide="book"></i>Hasta 50 libros</p>
                <p class="feature enterprise hidden"><i data-lucide="book"></i>Hasta 500 libros</p>
                <p class="feature education hidden"><i data-lucide="book"></i>Hasta 200 libros</p>
                <p class="feature individual"><i data-lucide="notepad-text"></i>Hasta 100 notas por libro</p>
                <p class="feature enterprise hidden"><i data-lucide="notepad-text"></i>Hasta 1000 notas por libro</p>
                <p class="feature education hidden"><i data-lucide="notepad-text"></i>Hasta 500 notas por libro</p>
                <p class="feature individual"><i data-lucide="paperclip"></i>Hasta 20 archivos adjuntos por nota</p>
                <p class="feature enterprise hidden"><i data-lucide="paperclip"></i>Hasta 200 archivos adjuntos por nota</p>
                <p class="feature education hidden"><i data-lucide="paperclip"></i>Hasta 100 archivos adjuntos por nota</p>
            </section>
        </article>
    </main>

    <div class="subscription-modal-overlay hidden" id="cancelSubModalOverlay" aria-hidden="true">
        <div class="subscription-modal" role="dialog" aria-modal="true" aria-labelledby="cancelSubModalTitle" aria-describedby="cancelSubModalDesc">
            <h3 id="cancelSubModalTitle">Confirmar cancelación</h3>
            <p id="cancelSubModalDesc">Tu plan de pago se cancelará y al finalizar tu periodo vigente pasarás a Gratis Individual. ¿Deseas continuar?</p>
            <div class="subscription-modal-actions">
                <button type="button" class="subscription-modal-btn subscription-modal-btn-secondary" id="cancelSubModalClose">Volver</button>
                <button type="button" class="subscription-modal-btn subscription-modal-btn-danger" id="cancelSubModalConfirm">Sí, cancelar</button>
            </div>
        </div>
    </div>

    <script src="../js/User/Subscriptions.js"></script>
    <script>lucide.createIcons({attrs: {'stroke-width': 1.6, stroke: 'currentColor'}});</script>
    <script src="../js/includes/sidebar.js"></script>
</body>
</html>