const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

async function postNewPost(req, res) {
    if (!req.isAuthenticated()) {
        return res.status(401).send('Not authenticated');
    }

    const { topic, content } = req.body;

    try {
        const rawTopic = topic?.trim();
        const normalizedTopic = rawTopic?.toLowerCase();

        const data = {
            content: content,
            published: true,
            author: {
                connect: { id: req.user.id }
            }
        };

        if (normalizedTopic) {
            data.topic = {
                connectOrCreate: {
                    where: { title: normalizedTopic },
                    create: {
                        title: normalizedTopic,
                        displayTitle: rawTopic
                    }
                }
            };
        }
        
        await prisma.post.create({ data });
        console.log('Post created');
        res.redirect('/');
    } catch (err) {
        console.error('Error creating post:', err);
        res.status(500).send('An error occurred during post creation');
    }
}

async function postToggleLike(req, res) {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = req.user.id;
    const postId = parseInt(req.body.postId);

    try {
        const liked = await prisma.postLike.findUnique({
            where: {
                userId_postId: {
                    userId,
                    postId
                }
            }
        });

        if (liked) {
            await prisma.postLike.delete({
                where: {
                    userId_postId: {
                        userId,
                        postId
                    }
                }
            });
        } else {
            await prisma.postLike.create({
                data: {
                    userId,
                    postId
                }
            });
        }

        const likeCount = await prisma.postLike.count({ where: { postId }});
        const isLiked = !liked;

        res.json({ likeCount, isLiked });
    } catch (err) {
        console.error('Error toggling like:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function getPost(req, res) {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    const postId = parseInt(req.params.id);

    try {
        const post = await prisma.post.findUnique({
            where: { id: postId },
            include: {
                author: { select: { id: true, username: true } },
                topic: { select: { id: true, displayTitle: true } },
                comments: {
                    include: {
                        author: { select: { id: true, username: true } }
                    },
                    orderBy: { createdAt: 'asc' }
                },
                _count: { select: { likes: true, comments: true } },
                likes: {
                    include: {
                        user: { select: { id: true, username: true } }
                    }
                }
            }
        });

        if (!post) return res.status(404).json({ error: 'Post not found' });

        const isLiked = post.likes.some(like => like.userId === req.user.id);
        const postView = {
            ...post,
            isLiked,
        };

        res.render('post', { user: req.user, post: postView });
    } catch (err) {
        console.error('Error fetching post:', err);
        return res.status(500).json({ error: 'Error fetching post' });
    }
}

module.exports = {
    postNewPost,
    postToggleLike,
    getPost,
}