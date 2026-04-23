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
