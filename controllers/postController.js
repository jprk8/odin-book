const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();
const { body, validationResult } = require('express-validator');

const validateContent = [
    body('content').trim()
        .isLength({ min: 1, max: 500 })
        .withMessage('Content must be 1-500 characters.'),
]

async function handleNewPost(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('index', { errors: errors.array() });
    }

    if (!req.isAuthenticated()) {
        return res.status(401).send('Not authenticated');
    }

    const { topic, content, redirectUrl } = req.body;

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
        res.redirect(redirectUrl || '/');
    } catch (err) {
        console.error('Error creating post:', err);
        res.status(500).send('An error occurred during post creation');
    }
}

async function handleNewComment(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('index', { errors: errors.array() });
    }

    if (!req.isAuthenticated()) {
        return res.status(401).send('Not authenticated');
    }

    try {
        const data = {
            content: req.body.content,
            author: {
                connect: { id: req.user.id }
            },
            post: {
                connect: { id: parseInt(req.body.postId) }
            }
        };

        await prisma.comment.create({ data });
        console.log('Comment created');
        res.redirect(`/posts/${req.body.postId}`);
    } catch (err) {
        console.error('Error creating comment:', err);
        res.status(500).json({ error: 'Error creating comment' });
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
                        author: { select: { id: true, username: true } },
                        _count: { select: { likes: true } }
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
    postNewPost: [validateContent, handleNewPost],
    postNewComment: [validateContent, handleNewComment],
    postToggleLike,
    getPost,
}