const sun = document.getElementById('icon-sun');
const moon = document.getElementById('icon-moon');
const decoration = document.querySelectorAll('.bg-decoration');
const labels = document.querySelectorAll('.label-input');
const inputs = document.querySelectorAll('.input');
const googleIcon = document.getElementById('google');
const regiterBtn = document.getElementById('register-btn');
const errorMessage = document.querySelector('.error');
const passwordInput = document.getElementById('password');

const theme = localStorage.getItem('theme');

if (errorMessage) {
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 5000);
}

if (theme === 'light') {
    document.body.classList.add('light-mode');
    decoration.forEach(dec => dec.classList.add('light-mode-dec'));
    labels.forEach(label => label.classList.add('light-mode-label'));
    inputs.forEach(input => input.classList.add('light-mode-input'));
    googleIcon.classList.add('light-mode-google');
    regiterBtn.classList.add('light-mode-btn-register');
    sun.classList.add('hidden');
    moon.classList.remove('hidden');
}

function toggleTheme() {

    document.body.classList.toggle('light-mode');

    sun.classList.toggle('hidden');
    moon.classList.toggle('hidden');

    if (document.body.classList.contains('light-mode')) {
        localStorage.setItem('theme', 'light');
        decoration.forEach(dec => dec.classList.add('light-mode-dec'));
        labels.forEach(label => label.classList.add('light-mode-label'));
        inputs.forEach(input => input.classList.add('light-mode-input'));
        googleIcon.classList.add('light-mode-google');
        regiterBtn.classList.add('light-mode-btn-register');
    } else {
        localStorage.setItem('theme', 'dark');
        decoration.forEach(dec => dec.classList.remove('light-mode-dec'));
        labels.forEach(label => label.classList.remove('light-mode-label'));
        inputs.forEach(input => input.classList.remove('light-mode-input'));
        googleIcon.classList.remove('light-mode-google');
        regiterBtn.classList.remove('light-mode-btn-register');
    }
}

sun.addEventListener('click', toggleTheme);
moon.addEventListener('click', toggleTheme);

function setPasswordVisibility(showPassword) {
    if (!passwordInput) {
        return;
    }

    const showPasswordIcon = document.getElementById('show-password');
    const hidePasswordIcon = document.getElementById('hide-password');

    passwordInput.type = showPassword ? 'text' : 'password';

    if (showPasswordIcon && hidePasswordIcon) {
        showPasswordIcon.classList.toggle('hidden', showPassword);
        hidePasswordIcon.classList.toggle('hidden', !showPassword);
    }
}

document.addEventListener('click', (event) => {
    const toggleIcon = event.target.closest('#show-password, #hide-password');

    if (!toggleIcon || !passwordInput) {
        return;
    }

    event.preventDefault();
    setPasswordVisibility(toggleIcon.id === 'show-password');
});