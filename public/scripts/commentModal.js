const commentDialog = document.getElementById('comment-modal');
const replyBtn = document.querySelector('.reply-btn');
const closeCommentModal = document.querySelector('.close-comment-modal');

replyBtn.addEventListener('click', () => {
    commentDialog.showModal();
});

closeCommentModal.addEventListener('click', () => {
    commentDialog.close();
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