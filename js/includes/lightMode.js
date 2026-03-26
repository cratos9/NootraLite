const sun = document.getElementById('icon-sun');
const moon = document.getElementById('icon-moon');
const theme = localStorage.getItem('theme');

if (theme === 'light') {
    document.body.classList.add('light-mode');
    sun.classList.add('hidden');
    moon.classList.remove('hidden');
}

function toggleTheme() {

    document.body.classList.toggle('light-mode');

    sun.classList.toggle('hidden');
    moon.classList.toggle('hidden');

    const isLight = document.body.classList.contains('light-mode');

    localStorage.setItem('theme', isLight ? 'light' : 'dark');
}

sun.addEventListener('click', toggleTheme);
moon.addEventListener('click', toggleTheme);