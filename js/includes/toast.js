var message = (function() {
    var ICONS = {
        success: 'check-circle',
        error:   'x-circle',
        warning: 'alert-triangle',
        tip:     'info'
    };
    var DURATION = 3000;
    var GAP = 12;

    function isMobile() {
        return window.innerWidth <= 400;
    }

    function getBase() {
        return isMobile() ? 16 : 24;
    }

    function repositionAll() {
        var toasts = document.querySelectorAll('.nootra-toast:not(.hide)');
        var offset = getBase();
        var mobile = isMobile();
        for (var i = 0; i < toasts.length; i++) {
            if (mobile) {
                toasts[i].style.top = offset + 'px';
                toasts[i].style.bottom = 'auto';
            } else {
                toasts[i].style.bottom = offset + 'px';
                toasts[i].style.top = '';
            }
            offset += toasts[i].offsetHeight + GAP;
        }
    }

    function show(msg, type) {
        var el = document.createElement('div');
        el.className = 'nootra-toast nootra-toast-' + type;

        var iconWrap = document.createElement('div');
        iconWrap.className = 'nootra-toast-icon';
        var icon = document.createElement('i');
        icon.setAttribute('data-lucide', ICONS[type]);
        iconWrap.appendChild(icon);
        el.appendChild(iconWrap);

        var span = document.createElement('span');
        span.textContent = msg;
        el.appendChild(span);

        var bar = document.createElement('div');
        bar.className = 'nootra-toast-bar';
        el.appendChild(bar);

        document.body.appendChild(el);
        if (typeof lucide !== 'undefined') lucide.createIcons({ root: el });

        repositionAll();

        el.addEventListener('click', function() { dismiss(el); });
        el._toastTimer = setTimeout(function() { dismiss(el); }, DURATION);
    }

    function dismiss(el) {
        clearTimeout(el._toastTimer);
        el.classList.add('hide');
        setTimeout(function() {
            if (el.parentNode) el.parentNode.removeChild(el);
            repositionAll();
        }, 300);
    }

    return {
        success: function(msg) { show(msg, 'success'); },
        error:   function(msg) { show(msg, 'error'); },
        warning: function(msg) { show(msg, 'warning'); },
        tip:     function(msg) { show(msg, 'tip'); }
    };
})();
