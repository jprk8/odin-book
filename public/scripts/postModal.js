const postDialog = document.getElementById('post-modal');
const navBtn = document.querySelector('.new-post-btn');
const closePostModal = document.querySelector('.close-post-modal');
const redirectUrl = document.getElementById('redirectUrl');

navBtn.addEventListener('click', () => {
    redirectUrl.value = location.pathname + location.search + location.hash;
    postDialog.showModal();
});

closePostModal.addEventListener('click', () => {
    postDialog.close();
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