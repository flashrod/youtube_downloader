// static/scripts.js
document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    form.addEventListener('submit', function() {
        // Add a loading spinner when the form is submitted
        const button = form.querySelector('button');
        button.textContent = "Downloading...";
        button.disabled = true;
    });
});
