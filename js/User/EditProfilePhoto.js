document.addEventListener('DOMContentLoaded', function () {
    const photoInput = document.getElementById('photo-input');
    const photoPreview = document.getElementById('photo');

    if (!photoInput || !photoPreview) {
        return;
    }

    photoInput.addEventListener('change', function (e) {
        const file = e.target.files && e.target.files[0];

        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.onload = function (event) {
            photoPreview.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });
});
