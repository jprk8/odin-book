const dialog = document.getElementById('post-modal');
const navBtn = document.querySelector('.open-modal');
const closeBtn = document.querySelector('.close-modal');

navBtn.addEventListener('click', () => {
    dialog.showModal();
});

closeBtn.addEventListener('click', () => {
    dialog.close();
});

document.addEventListener('DOMContentLoaded', () => {
    const textarea = document.getElementById('content');
    const autoResize = () => {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    };

    textarea.addEventListener('input', autoResize);
    autoResize();
});