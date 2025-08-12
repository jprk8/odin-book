const modal = document.getElementById('post-modal');
const navBtn = document.querySelector('.new-post-btn');
const closePostModal = document.querySelector('.close-post-modal');
const redirectUrl = document.getElementById('redirectUrl');
const textarea = document.getElementById('modal-content');

navBtn.addEventListener('click', () => {
    redirectUrl.value = location.pathname + location.search + location.hash;
    modal.showModal();
    textarea.focus();
});

closePostModal.addEventListener('click', () => {
    modal.close();
});

modal.addEventListener('click', (e) => {
    const rect = modal.getBoundingClientRect();
    const inDialog = (
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom
    );
    if (!inDialog) modal.close();
});

document.addEventListener('DOMContentLoaded', () => {
    const autoResize = () => {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    };

    textarea.addEventListener('input', autoResize);
    autoResize();
});