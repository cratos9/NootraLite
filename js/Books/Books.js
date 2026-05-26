const booksList = document.querySelector('.books-list');
const sortToggle = document.getElementById('sortToggle');
const sortToggleLabel = document.getElementById('sortToggleLabel');

const SORT_STORAGE_KEY = 'nootralite.books.sortOrder';

const sortModes = [
    {
        key: 'title-asc',
        label: 'A-Z',
        icon: 'arrow-up-a-z'
    },
    {
        key: 'title-desc',
        label: 'Z-A',
        icon: 'arrow-down-z-a'
    },
    {
        key: 'last-accessed-desc',
        label: 'Última vista reciente',
        icon: 'clock-3'
    },
    {
        key: 'last-accessed-asc',
        label: 'Última vista antigua',
        icon: 'clock-3'
    }
];

function normalizeText(value) {
    return (value || '').toString().trim().toLocaleLowerCase('es');
}

function getSavedModeIndex() {
    const savedMode = localStorage.getItem(SORT_STORAGE_KEY);
    const foundIndex = sortModes.findIndex((mode) => mode.key === savedMode);
    return foundIndex >= 0 ? foundIndex : 0;
}

function compareByTitle(leftCard, rightCard, direction) {
    const leftTitle = normalizeText(leftCard.dataset.bookTitle);
    const rightTitle = normalizeText(rightCard.dataset.bookTitle);
    return leftTitle.localeCompare(rightTitle, 'es', { sensitivity: 'base' }) * direction;
}

function compareByLastAccessed(leftCard, rightCard, direction) {
    const leftTimestamp = Number(leftCard.dataset.lastAccessed || 0);
    const rightTimestamp = Number(rightCard.dataset.lastAccessed || 0);

    if (leftTimestamp === rightTimestamp) {
        return compareByTitle(leftCard, rightCard, 1);
    }

    return (leftTimestamp - rightTimestamp) * direction;
}

function updateButtonState(mode) {
    if (!sortToggle || !sortToggleLabel) {
        return;
    }

    sortToggleLabel.textContent = mode.label;

    const icon = sortToggle.querySelector('.sort-icon');
    if (icon) {
        icon.setAttribute('data-lucide', mode.icon);
    }

    sortToggle.setAttribute('title', `Orden actual: ${mode.label}`);
    sortToggle.setAttribute('aria-label', `Cambiar orden de libros. Orden actual: ${mode.label}`);

    if (typeof lucide !== 'undefined' && typeof lucide.createIcons === 'function') {
        lucide.createIcons({ attrs: { 'stroke-width': 1.6, stroke: 'currentColor' } });
    }
}

function sortBooks(mode) {
    if (!booksList) {
        return;
    }

    const cards = Array.from(booksList.querySelectorAll('.book-card'));

    cards.sort((leftCard, rightCard) => {
        switch (mode.key) {
            case 'title-desc':
                return compareByTitle(leftCard, rightCard, -1);
            case 'last-accessed-desc':
                return compareByLastAccessed(leftCard, rightCard, -1);
            case 'last-accessed-asc':
                return compareByLastAccessed(leftCard, rightCard, 1);
            case 'title-asc':
            default:
                return compareByTitle(leftCard, rightCard, 1);
        }
    });

    cards.forEach((card) => booksList.appendChild(card));
}

function setMode(modeIndex) {
    const normalizedIndex = (modeIndex + sortModes.length) % sortModes.length;
    const mode = sortModes[normalizedIndex];

    localStorage.setItem(SORT_STORAGE_KEY, mode.key);
    sortBooks(mode);
    updateButtonState(mode);
}

if (booksList && sortToggle) {
    const initialModeIndex = getSavedModeIndex();
    setMode(initialModeIndex);

    sortToggle.addEventListener('click', () => {
        const currentModeIndex = getSavedModeIndex();
        const nextModeIndex = (currentModeIndex + 1) % sortModes.length;
        setMode(nextModeIndex);
    });
}