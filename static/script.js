function toggleProject(header) {
    const projectItem = header.closest('.project-item');
    projectItem.classList.toggle('expanded');
}

// Initialize any other interactions when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Future interactive features can be added here
});