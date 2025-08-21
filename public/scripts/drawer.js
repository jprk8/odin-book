const drawerBtn = document.querySelector('.drawer-btn');
const drawer = document.querySelector('.drawer');
const drawerContainer = document.querySelector('.drawer-container');

function openDrawer() {
    drawer.classList.add('open');
    document.addEventListener('keydown', handleEscClose);
    document.addEventListener('click', handleOutsideClick);
}

function closeDrawer() {
    drawer.classList.remove('open');
    document.removeEventListener('keydown', handleEscClose);
    document.removeEventListener('click', handleOutsideClick);
}

function handleEscClose(e) {
    if (e.key === 'Escape') closeDrawer();
}

function handleOutsideClick(e) {
    if (!drawerContainer.contains(e.target)) closeDrawer();
}

drawerBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (drawer.classList.contains('open')) {
        closeDrawer();
    } else {
        openDrawer();
    }
});