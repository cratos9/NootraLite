const titleInput = document.getElementById('title');
const descriptionInput = document.getElementById('description');
const colorInput = document.getElementById('color');
const categoryInput = document.getElementById('category');
const semesterInput = document.getElementById('semester');
const tagsInput = document.getElementById('tags');

const previewTitle = document.getElementById('previewTitle');
const previewDescription = document.getElementById('previewDescription');
const previewCategory = document.getElementById('previewCategory');
const previewSemester = document.getElementById('previewSemester');
const previewTags = document.getElementById('previewTags');
const semesterContainer = document.getElementById('semesterContainer');
const tagsContainer = document.getElementById('tagsContainer');
const bookPreview = document.getElementById('bookPreview');
const previewIcon = document.querySelector('.icon-book-preview');

function updatePreview() {
    previewTitle.textContent = titleInput.value.trim() || 'Título del Libro';
    previewDescription.textContent = descriptionInput.value.trim() || 'Sin descripción';

    const selectedColor = colorInput.value || '#000000';
    bookPreview.style.setProperty('--book-color', selectedColor);
    bookPreview.style.borderColor = selectedColor;
    previewIcon.style.color = selectedColor;

    previewCategory.textContent = categoryInput.value.trim() || 'Sin categoría';

    if (semesterInput.value.trim()) {
        previewSemester.textContent = semesterInput.value.trim();
        semesterContainer.style.display = 'block';
    } else {
        semesterContainer.style.display = 'none';
    }

    if (tagsInput.value.trim()) {
        previewTags.textContent = tagsInput.value.trim();
        tagsContainer.style.display = 'block';
    } else {
        tagsContainer.style.display = 'none';
    }
}

titleInput.addEventListener('input', updatePreview);
descriptionInput.addEventListener('input', updatePreview);
colorInput.addEventListener('input', updatePreview);
categoryInput.addEventListener('input', updatePreview);
semesterInput.addEventListener('input', updatePreview);
tagsInput.addEventListener('input', updatePreview);

updatePreview();
