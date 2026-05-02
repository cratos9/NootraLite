function avatarColor(name) {
    var colors = ['#7c3aed','#ec4899','#2563eb','#059669','#d97706','#dc2626'];
    var i = 0;
    if (name) for (var c = 0; c < name.length; c++) i += name.charCodeAt(c);
    return colors[i % colors.length];
}

function initials(name) {
    if (!name) return '?';
    var parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
}

function formatTime(dt) {
    if (!dt) return '';
    var d = new Date(dt);
    var now = new Date();
    var diffDays = Math.floor((now - d) / 86400000);
    if (diffDays === 0) {
        var h = d.getHours().toString().padStart(2,'0');
        var m = d.getMinutes().toString().padStart(2,'0');
        return h + ':' + m;
    }
    if (diffDays === 1) return 'ayer';
    if (diffDays < 7) {
        var dias = ['dom','lun','mar','mié','jue','vie','sáb'];
        return dias[d.getDay()];
    }
    return d.getDate() + '/' + (d.getMonth()+1);
}

function formatMsgTime(dt) {
    if (!dt) return '';
    var d = new Date(dt);
    return d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0');
}

function escapeHtml(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function formatLastSeen(str) {
    if (!str) return 'Desconectado';
    var d = new Date(str), now = new Date();
    var diff = Math.floor((now - d) / 1000);
    if (diff < 120) return 'Hace un momento';
    if (diff < 3600) return 'Hace ' + Math.floor(diff / 60) + ' min';
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var yest  = new Date(today); yest.setDate(yest.getDate() - 1);
    var t = d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
    if (d >= today) return 'Hoy a las ' + t;
    if (d >= yest)  return 'Ayer a las ' + t;
    var days = Math.floor((now - d) / 86400000);
    return days < 30 ? 'Hace ' + days + ' días' : 'Hace tiempo';
}
