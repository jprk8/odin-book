document.addEventListener('DOMContentLoaded', () => {
    const threadsTab = document.getElementById('threads-tab');
    const repliesTab = document.getElementById('replies-tab');
    const savedTab = document.getElementById('saved-tab');

    const threadsContainer = document.querySelector('.threads-container');
    const repliesContainer = document.querySelector('.replies-container');

    threadsTab.addEventListener('click', () => {
        threadsContainer.style.display = 'block';
        repliesContainer.style.display = 'none';

        threadsTab.classList.add('active-tab');
        repliesTab.classList.remove('active-tab');
        savedTab.classList.remove('active-tab');
    });

    repliesTab.addEventListener('click', () => {
        threadsContainer.style.display = 'none';
        repliesContainer.style.display = 'block';

        threadsTab.classList.remove('active-tab');
        repliesTab.classList.add('active-tab');
        savedTab.classList.remove('active-tab');
    });

    savedTab.addEventListener('click', () => {
        threadsContainer.style.display = 'none';
        repliesContainer.style.display = 'none';

        threadsTab.classList.remove('active-tab');
        repliesTab.classList.remove('active-tab');
        savedTab.classList.add('active-tab');
    });
});