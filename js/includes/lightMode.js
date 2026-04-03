const savedTheme = (localStorage.getItem('theme') || 'dark').trim().toLowerCase();

function updateThemeIcons(isLight) {
    const sun = document.getElementById('icon-sun');
    const moon = document.getElementById('icon-moon');

    if (!sun || !moon) {
        return;
    }

    sun.classList.toggle('hidden', isLight);
    moon.classList.toggle('hidden', !isLight);
}

function applyTheme(isLight) {
    document.body.classList.toggle('light-mode', isLight);
    updateThemeIcons(isLight);
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
}

applyTheme(savedTheme === 'light');

document.addEventListener('click', (event) => {
    const toggleIcon = event.target.closest('#icon-sun, #icon-moon');

    if (!toggleIcon) {
        return;
    }

    const isLight = !document.body.classList.contains('light-mode');
    applyTheme(isLight);
});