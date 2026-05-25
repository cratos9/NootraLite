const sortStorageKeyPrefix = 'nootralite.bookView.sort.';
const sortLabels = {
    'title-asc': 'A-Z',
    'title-desc': 'Z-A',
    'last-accessed-desc': 'Última vista reciente',
    'last-accessed-asc': 'Última vista antigua'
};

function normalizeText(value) {
    return (value || '').toString().trim().toLocaleLowerCase('es');
}

function getModeIndex(targetKey) {
    const storageKey = `${sortStorageKeyPrefix}${targetKey}`;
    const savedMode = localStorage.getItem(storageKey);
    const modeKeys = Object.keys(sortLabels);
    const foundIndex = modeKeys.indexOf(savedMode);
    return foundIndex >= 0 ? foundIndex : 0;
}

function compareByTitle(leftItem, rightItem, direction) {
    const leftTitle = normalizeText(leftItem.dataset.itemTitle);
    const rightTitle = normalizeText(rightItem.dataset.itemTitle);
    return leftTitle.localeCompare(rightTitle, 'es', { sensitivity: 'base' }) * direction;
}

function compareByDate(leftItem, rightItem, direction) {
    const leftDate = Number(leftItem.dataset.itemDate || 0);
    const rightDate = Number(rightItem.dataset.itemDate || 0);

    if (leftDate === rightDate) {
        return compareByTitle(leftItem, rightItem, 1);
    }

    return (leftDate - rightDate) * direction;
}

function sortCollection(listElement, modeKey) {
    const items = Array.from(listElement.querySelectorAll('.card'));

    items.sort((leftItem, rightItem) => {
        switch (modeKey) {
            case 'title-desc':
                return compareByTitle(leftItem, rightItem, -1);
            case 'last-accessed-desc':
                return compareByDate(leftItem, rightItem, -1);
            case 'last-accessed-asc':
                return compareByDate(leftItem, rightItem, 1);
            case 'title-asc':
            default:
                return compareByTitle(leftItem, rightItem, 1);
        }
    });

    items.forEach((item) => listElement.appendChild(item));
}

function updateButton(button, labelElement, modeKey, targetKey) {
    labelElement.textContent = sortLabels[modeKey];
    button.setAttribute('aria-label', `Cambiar orden de ${targetKey === 'notes' ? 'notas' : 'sublibros'}. Orden actual: ${sortLabels[modeKey]}`);
}

function initSorter(targetKey) {
    const button = document.querySelector(`[data-sort-target="${targetKey}"]`);
    const label = document.querySelector(`[data-sort-label="${targetKey}"]`);
    const listElement = document.querySelector(`[data-sort-list="${targetKey}"]`);

    if (!button || !label || !listElement) {
        return;
    }

    const storageKey = `${sortStorageKeyPrefix}${targetKey}`;
    const modeKeys = Object.keys(sortLabels);
    let currentIndex = getModeIndex(targetKey);

    const applyMode = (nextIndex) => {
        currentIndex = (nextIndex + modeKeys.length) % modeKeys.length;
        const modeKey = modeKeys[currentIndex];
        localStorage.setItem(storageKey, modeKey);
        sortCollection(listElement, modeKey);
        updateButton(button, label, modeKey, targetKey);
    };

    applyMode(currentIndex);

    button.addEventListener('click', () => {
        applyMode(currentIndex + 1);
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initSorter('notes');
        initSorter('children');
    });
} else {
    initSorter('notes');
    initSorter('children');
}