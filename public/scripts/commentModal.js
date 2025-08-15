const commentModal = document.getElementById('comment-modal');
const modalPostId = document.getElementById('modal-postId');
const modalParentId = document.getElementById('modal-parentId');
const modalTargetUsername = document.getElementById('modal-target-username');
const modalTargetContent = document.getElementById('modal-target-content');
const modalGravatar = document.getElementById('modal-gravatar');
const commentTextarea = document.getElementById('comment-content');
const closeCommentModal = document.querySelector('.close-comment-modal');

document.querySelectorAll('.open-comment-modal').forEach((btn) => {
    btn.addEventListener('click', () => {
        const postId = btn.dataset.postId;
        const parentId = btn.dataset.parentId || '';
        const targetUsername = btn.dataset.targetUsername;
        const targetContent = btn.dataset.targetContent;
        const targetGravatar = btn.dataset.targetGravatar;

        modalPostId.value = postId;
        modalParentId.value = parentId;
        modalTargetUsername.textContent = targetUsername;
        modalTargetContent.textContent = targetContent;
        modalGravatar.src = targetGravatar;
        commentTextarea.placeholder = `Reply to ${targetUsername}`;

        commentModal.showModal();
        commentTextarea.focus();
    })
})

closeCommentModal.addEventListener('click', () => {
    commentModal.close();
});

commentModal.addEventListener('click', (e) => {
    const rect = commentModal.getBoundingClientRect();
    const inDialog = (
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom
    );
    if (!inDialog) commentModal.close();
});

document.addEventListener('DOMContentLoaded', () => {
    const autoResize = () => {
        commentTextarea.style.height = 'auto';
        commentTextarea.style.height = commentTextarea.scrollHeight + 'px';
    };

    commentTextarea.addEventListener('input', autoResize);
    autoResize();
});