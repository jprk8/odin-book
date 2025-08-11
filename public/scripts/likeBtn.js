document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.like-btn').forEach((btn) => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            const post = btn.closest('[data-post-id]');
            const postId = post.dataset.postId;

            try {
                const res = await fetch('/posts/toggle-like', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ postId })
                });

                if (!res.ok) return alert('Error liking post');
                const data = await res.json();

                const likeCount = post.querySelector('.like-count');
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