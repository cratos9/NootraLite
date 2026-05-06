<?php
if (session_status() === PHP_SESSION_NONE) session_start();
$_su = $_SESSION['user'] ?? [];
$_sidebarUsername = $_su['username'] ?? 'Usuario';
$_sidebarAvatar = !empty($_su['avatar_url']) ? htmlspecialchars($_su['avatar_url']) : '';
$_sidebarInitials = strtoupper(substr(preg_replace('/[^a-zA-Z]/', '', $_sidebarUsername), 0, 2)) ?: 'U';

// Leer plan fresco de subscriptions para que siempre esté actualizado
$_sidebarPlan = $_su['plan'] ?? 'free';
if (!empty($_su['id'])) {
    require_once __DIR__ . '/../config/db.php';
    $_db = (new Database())->connect();
    $__s = $_db->prepare('SELECT plan_type FROM subscriptions WHERE user_id = ? LIMIT 1');
    $__s->execute([$_su['id']]);
    $__row = $__s->fetch(PDO::FETCH_ASSOC);
    if ($__row) {
        $_sidebarPlan = $__row['plan_type'];
        $_SESSION['user']['plan'] = $__row['plan_type'];
    }
}

$_sidebarLoggedIn = !empty($_su['id']);
$_planLabels = ['free' => 'Gratis', 'pro' => 'Pro', 'mega' => 'Mega'];
$_sidebarPlanLabel = $_planLabels[$_sidebarPlan] ?? 'Gratis';
$_avColors = ['#7c3aed','#ec4899','#6366f1','#06b6d4','#10b981','#f59e0b','#3b82f6','#8b5cf6'];
$_acSum = 0; foreach (str_split($_sidebarUsername) as $c) $_acSum += ord($c);
$_sidebarAvatarColor = $_avColors[$_acSum % count($_avColors)];
?>
<script>if(localStorage.getItem('theme')==='light')(document.body||document.documentElement).classList.add('light-mode')</script>
<div class="sidebar-overlay" id="sidebar-overlay"></div>
<aside class="sidebar">
    <div class="sidebar-logo">
        <img src="../assets/icon.png" alt="Nootra" class="logo-icon" width="36" height="36">
        <span class="logo-text">NOOTRA</span>
        <button class="sidebar-close" aria-label="Cerrar"><i data-lucide="x"></i></button>
    </div>
    <nav class="sidebar-nav">
        <a class="nav-item <?= ($activePage ?? '') === 'dashboard' ? 'active' : '' ?>" href="../dashboard/index.php" data-tooltip="Dashboard">
            <i data-lucide="house"></i> <span>Dashboard</span>
        </a>
        <a class="nav-item <?= ($activePage ?? '') === 'calendar' ? 'active' : '' ?>" href="../calendar/calendar.php" data-tooltip="Calendario">
            <i data-lucide="calendar-days"></i> <span>Calendario</span>
        </a>
        <a class="nav-item <?= ($activePage ?? '') === 'notebooks' ? 'active' : '' ?>" href="../Books/Books.php" data-tooltip="Cuadernos">
            <i data-lucide="book-open"></i> <span>Cuadernos</span>
        </a>
        <a class="nav-item <?= ($activePage ?? '') === 'tasks' ? 'active' : '' ?>" href="../task/index.php" data-tooltip="Tareas">
            <i data-lucide="check-square"></i> <span>Tareas</span>
        </a>
        <a class="nav-item nav-item-messages <?= ($activePage ?? '') === 'messages' ? 'active' : '' ?>" id="messagesNavItem" href="../messages/messages.php" data-tooltip="Mensajes" style="position:relative;">
            <i data-lucide="message-circle"></i> <span>Mensajes</span>
            <span class="nav-msg-badge" id="navMsgBadge" style="display:none"></span>
        </a>
        <a class="nav-item <?= ($activePage ?? '') === 'quick-notes' ? 'active' : '' ?>" href="#" data-tooltip="Notas rápidas">
            <i data-lucide="notepad-text"></i> <span>Notas rápidas</span>
        </a>
    </nav>
    <?php if ($_sidebarLoggedIn): ?>
    <div class="sidebar-user-widget" id="sidebarUserBtn" role="button" tabindex="0" aria-haspopup="true" aria-expanded="false" aria-label="Cuenta de <?= htmlspecialchars($_sidebarUsername) ?>">
        <div class="sidebar-user-avatar"<?= !$_sidebarAvatar ? ' style="background-color:' . $_sidebarAvatarColor . '"' : '' ?>>
            <?php if ($_sidebarAvatar): ?>
                <img src="<?= $_sidebarAvatar ?>" alt="<?= htmlspecialchars($_sidebarUsername) ?>">
            <?php else: ?>
                <span><?= htmlspecialchars($_sidebarInitials) ?></span>
            <?php endif; ?>
        </div>
        <div class="sidebar-user-info">
            <span class="sidebar-user-name"><?= htmlspecialchars($_sidebarUsername) ?></span>
            <span class="sidebar-plan-badge plan-<?= htmlspecialchars($_sidebarPlan) ?>"><?= htmlspecialchars($_sidebarPlanLabel) ?></span>
        </div>
        <?php if ($_sidebarPlan === 'free'): ?>
        <a href="../User/Subscriptions.php" class="sidebar-upgrade-btn">Mejorar</a>
        <?php endif; ?>
    </div>
    <?php else: ?>
    <div class="sidebar-user-widget sidebar-guest-widget" id="sidebarUserBtn" role="button" tabindex="0" aria-haspopup="true" aria-expanded="false" aria-label="Iniciar sesión">
        <div class="sidebar-guest-avatar">
            <i data-lucide="user-round"></i>
        </div>
        <div class="sidebar-user-info">
            <span class="sidebar-user-name">Invitado</span>
            <span class="sidebar-guest-hint">Inicia sesión</span>
        </div>
        <div class="sidebar-guest-arrow">
            <i data-lucide="log-in"></i>
        </div>
    </div>
    <?php endif; ?>
</aside>

<?php if ($_sidebarLoggedIn): ?>
<div id="accountModal" class="account-modal" role="dialog" aria-modal="true" aria-label="Cuenta">
    <div class="acm-header">
        <div class="acm-avatar" id="acmAvatar"<?= !$_sidebarAvatar ? ' style="background-color:' . $_sidebarAvatarColor . '"' : '' ?>>
            <?php if ($_sidebarAvatar): ?>
                <img src="<?= $_sidebarAvatar ?>" alt="<?= htmlspecialchars($_sidebarUsername) ?>">
            <?php else: ?>
                <span><?= htmlspecialchars($_sidebarInitials) ?></span>
            <?php endif; ?>
        </div>
        <div class="acm-header-info">
            <span class="acm-username"><?= htmlspecialchars($_sidebarUsername) ?></span>
            <span class="acm-plan-badge plan-<?= htmlspecialchars($_sidebarPlan) ?>"><?= htmlspecialchars($_sidebarPlanLabel) ?></span>
        </div>
    </div>

    <?php if ($_sidebarPlan === 'free'): ?>
    <div class="acm-section" style="--i:0">
        <a href="../User/Subscriptions.php" class="acm-upgrade-row" id="acmUpgradeBtn">
            <div class="acm-upgrade-icon"><i data-lucide="zap"></i></div>
            <div class="acm-upgrade-text">
                <span>Mejorar Plan</span>
                <small>Desbloquea todas las funciones</small>
            </div>
            <i data-lucide="chevron-right" class="acm-upgrade-arrow"></i>
        </a>
    </div>
    <?php endif; ?>

    <div class="acm-separator"></div>

    <div class="acm-section" style="--i:<?= $_sidebarPlan === 'free' ? 1 : 0 ?>">
        <a class="acm-item" href="../User/profile.php">
            <div class="acm-item-icon"><i data-lucide="user"></i></div>
            <span>Perfil</span>
        </a>
        <a class="acm-item" href="#">
            <div class="acm-item-icon"><i data-lucide="settings"></i></div>
            <span>Configuración</span>
        </a>
    </div>

    <div class="acm-separator"></div>

    <div class="acm-section" style="--i:<?= $_sidebarPlan === 'free' ? 2 : 1 ?>">
        <div class="acm-toggle-row" id="acmThemeRow" role="button" tabindex="0" aria-label="Cambiar tema">
            <div class="acm-toggle-left">
                <div class="acm-theme-icon" id="acmThemeIcon">
                    <i data-lucide="moon" class="acm-icon-moon"></i>
                    <i data-lucide="sun" class="acm-icon-sun"></i>
                </div>
                <span class="acm-toggle-label">Modo oscuro</span>
            </div>
            <div class="acm-switch" id="acmSwitch" aria-checked="true" role="switch">
                <div class="acm-switch-thumb"></div>
            </div>
        </div>
    </div>

    <div class="acm-separator"></div>

    <div class="acm-section acm-section-danger" style="--i:<?= $_sidebarPlan === 'free' ? 3 : 2 ?>">
        <a class="acm-item acm-item-danger" href="../User/Logout.php">
            <div class="acm-item-icon acm-item-icon-danger"><i data-lucide="log-out"></i></div>
            <span>Cerrar sesión</span>
        </a>
    </div>
</div>
<?php else: ?>
<div id="accountModal" class="account-modal account-modal-guest" role="dialog" aria-modal="true" aria-label="Iniciar sesión">
    <div class="acm-header acm-header-guest">
        <div class="acm-guest-icon-wrap">
            <i data-lucide="user-round"></i>
        </div>
        <div>
            <div class="acm-guest-title">Bienvenido</div>
            <div class="acm-guest-sub">Inicia sesión para continuar</div>
        </div>
    </div>

    <div class="acm-section" style="--i:0">
        <a class="acm-auth-btn acm-auth-btn-primary" href="../User/Login.php">
            <div class="acm-auth-icon"><i data-lucide="log-in"></i></div>
            <span class="acm-auth-label">Iniciar sesión</span>
            <i data-lucide="arrow-right" class="acm-auth-arrow"></i>
        </a>
        <a class="acm-auth-btn acm-auth-btn-secondary" href="../User/Register.php">
            <div class="acm-auth-icon"><i data-lucide="user-plus"></i></div>
            <span class="acm-auth-label">Crear cuenta</span>
            <span class="acm-auth-free">Gratis</span>
        </a>
    </div>

    <div class="acm-separator"></div>

    <div class="acm-section" style="--i:1">
        <div class="acm-toggle-row" id="acmThemeRow" role="button" tabindex="0" aria-label="Cambiar tema">
            <div class="acm-toggle-left">
                <div class="acm-theme-icon" id="acmThemeIcon">
                    <i data-lucide="moon" class="acm-icon-moon"></i>
                    <i data-lucide="sun" class="acm-icon-sun"></i>
                </div>
                <span class="acm-toggle-label">Modo oscuro</span>
            </div>
            <div class="acm-switch" id="acmSwitch" aria-checked="true" role="switch">
                <div class="acm-switch-thumb"></div>
            </div>
        </div>
    </div>
</div>
<?php endif; ?>

<button class="btn-hamburger" aria-label="Menú"><i data-lucide="menu"></i></button>

<nav class="bottom-nav">
    <a class="bottom-nav-item <?= ($activePage ?? '') === 'dashboard' ? 'active' : '' ?>" href="../dashboard/index.php">
        <i data-lucide="house"></i><span>Inicio</span>
    </a>
    <a class="bottom-nav-item <?= ($activePage ?? '') === 'calendar' ? 'active' : '' ?>" href="../calendar/calendar.php">
        <i data-lucide="calendar-days"></i><span>Calendario</span>
    </a>
    <a class="bottom-nav-item <?= ($activePage ?? '') === 'tasks' ? 'active' : '' ?>" href="#">
        <i data-lucide="check-square"></i><span>Tareas</span>
    </a>
    <a class="bottom-nav-item <?= ($activePage ?? '') === 'messages' ? 'active' : '' ?>" id="messagesBottomItem" href="../messages/messages.php" style="position:relative;">
        <i data-lucide="message-circle"></i><span>Mensajes</span>
        <span class="bottom-msg-badge" id="bottomMsgBadge" style="display:none"></span>
    </a>
    <button class="bottom-nav-item bottom-nav-avatar<?= !$_sidebarLoggedIn ? ' bottom-nav-guest-btn' : '' ?>" id="bottomNavAvatarBtn" aria-label="<?= $_sidebarLoggedIn ? 'Cuenta' : 'Iniciar sesión' ?>" aria-haspopup="true">
        <div class="bottom-nav-avatar-circle<?= !$_sidebarLoggedIn ? ' bottom-nav-guest-circle' : '' ?>">
            <?php if ($_sidebarLoggedIn && $_sidebarAvatar): ?>
                <img src="<?= $_sidebarAvatar ?>" alt="<?= htmlspecialchars($_sidebarUsername) ?>">
            <?php elseif ($_sidebarLoggedIn): ?>
                <span><?= htmlspecialchars($_sidebarInitials) ?></span>
            <?php else: ?>
                <i data-lucide="user-round"></i>
            <?php endif; ?>
        </div>
        <span><?= $_sidebarLoggedIn ? 'Cuenta' : 'Entrar' ?></span>
    </button>
</nav>
