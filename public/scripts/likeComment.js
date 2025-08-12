document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.comment-like-btn').forEach((btn) => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            const comment = btn.closest('[data-comment-id]');
            const commentId = comment.dataset.commentId;

            try {
                const res = await fetch('/posts/toggle-like-comment', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ commentId: commentId })
                });

                if (!res.ok) return alert('Error liking post');
                const data = await res.json();

                const likeCount = comment.querySelector('.comment-like-count');
                const likeIcon = btn.querySelector('img');

                likeCount.textContent = data.likeCount;
                likeIcon.src = (data.isLiked) ? '/assets/heart-red.svg' : '/assets/heart-light.svg';
                likeIcon.alt = (data.isLiked) ? 'Unlike' : 'Like';
            } catch (err) {
                console.error('Error liking post:', err);
            }
        });
    });
});