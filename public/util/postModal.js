const dialog = document.getElementById('post-modal');
const navBtn = document.querySelector('.open-modal');
const closeBtn = document.querySelector('.close-modal');

navBtn.addEventListener('click', () => {
    dialog.showModal();
});

closeBtn.addEventListener('click', () => {
    dialog.close();
});