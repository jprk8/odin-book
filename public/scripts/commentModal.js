const dialog = document.getElementById('comment-modal');
const replyBtn = document.querySelector('.reply-btn');
const closeBtn = document.querySelector('.close-comment-modal');

replyBtn.addEventListener('click', () => {
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