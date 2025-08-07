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

module.exports = {
    postNewPost,
    postToggleLike,
}