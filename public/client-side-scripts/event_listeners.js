
document.addEventListener('DOMContentLoaded', function () {
    const toggleButtons = document.querySelectorAll('[data-modal-toggle]');
    const closeButtons = document.querySelectorAll('[data-modal-hide]');

    toggleButtons.forEach(button => {
        button.addEventListener('click', function () {
            const target = button.getAttribute('data-modal-target');
            const modal = document.getElementById(target);
            modal.classList.toggle('hidden');
            modal.classList.toggle('flex');
        });
    });

    closeButtons.forEach(button => {
        button.addEventListener('click', function () {
            const target = button.getAttribute('data-modal-hide');
            const modal = document.getElementById(target);
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        });
    });
});