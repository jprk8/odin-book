const modal = document.getElementById('post-modal');
const navBtn = document.querySelector('.new-post-btn');
const closePostModal = document.querySelector('.close-post-modal');
const redirectUrl = document.getElementById('redirectUrl');
const textarea = document.getElementById('modal-content');

function closeModal() {
    modal.classList.remove('is-open');
    modal.close();
}

navBtn.addEventListener('click', () => {
    redirectUrl.value = location.pathname + location.search + location.hash;
    modal.showModal();
    modal.classList.add('is-open');
    textarea.focus();
});

closePostModal.addEventListener('click', closeModal);

modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

modal.addEventListener('cancel', (e) => {
    e.preventDefault();
    closeModal();
});

document.addEventListener('DOMContentLoaded', () => {
    const autoResize = () => {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    };

    textarea.addEventListener('input', autoResize);
    autoResize();
});