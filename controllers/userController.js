const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const crypto = require('node:crypto');
const passport = require('passport');
const { gravatarUrl } = require('../utils/gravatar');
const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

const alphaErr = 'must contain only letters.';
const alphaNumErr = 'must contain only letters and numbers.'
const lengthErr = 'must be between 1 and 40 characters.';

const validateUser = [
    body('firstName').trim()
        .isAlpha().withMessage(`First name ${alphaErr}`)
        .isLength({ min: 1, max: 40 }).withMessage(`First name ${lengthErr}`)
        .customSanitizer((name) => name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()),
    body('lastName').optional({ checkFalsy: true }).trim()
        .isAlpha().withMessage(`Last name ${alphaErr}`)
        .isLength({ min: 1, max: 40 }).withMessage(`Last name ${lengthErr}`)
        .customSanitizer((name) => name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()),
    body('username').trim()
        .customSanitizer((username) => username.toLowerCase())
        .isAlphanumeric().withMessage(`Username ${alphaNumErr}`)
        .isLength({ min: 1, max: 40 }).withMessage(`Username ${lengthErr}`)
        .custom(async (value) => {
            const user = await prisma.user.findUnique({
                where: { username: value }
            });
            if (user) {
                throw new Error('Username is already taken');
            }
            return true;
        }),
    body('email').optional({ checkFalsy: true }).trim()
        .isEmail().withMessage('Please enter a valid email address')
        .customSanitizer((email) => email.toLowerCase())
        .custom(async (value) => {
            const user = await prisma.user.findUnique({
                where: { email: value }
            });
            if (user) {
                throw new Error('Email is already in use');
            }
            return true;
        }),
    body('confirmPassword')
        .custom((value, { req }) => value === req.body.password)
        .withMessage('Passwords do not match')
]

function sha265Hex(email) {
    return crypto.createHash('sha256').update(email).digest('hex');
}

async function getPosts(req) {
    const posts = await prisma.post.findMany({
        where: { published: true },
        orderBy: { createdAt: 'desc' },
        include: {
            author: true,
            topic: true,
            _count: {
                select: { likes: true, comments: true }
            },
            // this is used to determine isLiked by req.user
            likes: {
                where: { userId: req.user?.id || -1 },
                select: { id: true }
            }
        }
    });

    return posts.map((post) => ({
        ...post,
        isLiked: post.likes.length > 0
    }));
}

async function getFollowingPosts(req) {
    const posts = await prisma.post.findMany({
        where: {
            published: true,
            author: {
                followers: {
                    some: { followerId: req.user.id, status: 'ACCEPTED' },
                },
            },
        },
        orderBy: { createdAt: 'desc' },
        include: {
            author: true,
            topic: true,
            _count: {
                select: { likes: true, comments: true }
            },
            likes: {
                where: { userId: req.user?.id || -1 },
                select: { id: true },
                take: 1,
            }
        }
    });

    return posts.map((post) => ({
        ...post,
        isLiked: post.likes.length > 0
    }));
}

async function getIndex(req, res) {
    if (!req.isAuthenticated()) {
        return res.redirect('/login');
    }

    try {
        const posts = await getPosts(req);
        res.render('index', { user: req.user, posts: posts, gravatarUrl });
    } catch (err) {
        console.error('Error loading posts', err);
        res.status(500).json({ error: 'Failed to load posts' });
    }
}

async function getFollowingIndex(req, res) {
    if (!req.isAuthenticated()) {
        return res.redirect('/login');
    }

    try {
        const posts = await getFollowingPosts(req);
        res.render('index', { user: req.user, posts: posts, following: true, gravatarUrl });
    } catch (err) {
        console.error('Error loading following posts:', err);
        res.status(500).json({ error: 'Failed to load following posts ' });
    }
}

function getLogin(req, res) {
    res.render('login');
}

function getLogout(req, res) {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/login');
    });
}

function postLogin(req, res, next) {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login?fail'
    })(req, res, next);
}

function getSignup(req, res) {
    res.render('signup');
}

async function handlePostSignup(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('signup', { errors: errors.array() });
    }

    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const email = req.body.email;
        const gravatar = email ? sha265Hex(email) : null;
        await prisma.user.create({
            data: {
                username: req.body.username,
                firstName: req.body.firstName,
                lastName: req.body.lastName || null,
                password: hashedPassword,
                email,
                gravatar,
                profile: { create: {} }
            }
        });
        console.log('Registration success');
        res.redirect('/');
    } catch (err) {
        console.error('Error creating user with prisma:', err);
        res.status(500).send('An error occurred during registration');
    }
}

async function getProfile(req, res) {
    if (!req.isAuthenticated()) {
        return res.redirect('/login');
    }

    try {
        const userData = await prisma.user.findUnique({
            where: { id: parseInt(req.params.id) },
            include: {
                posts: {
                    include: {
                        author: true,
                        _count: { select: { likes: true, comments: true } },
                        likes: {
                            where: { userId: req.user?.id ?? -1 },
                            select: { id: true },
                            take: 1,
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                },
                profile: true,
                comments: {
                    include: {
                        author: true,
                        parent: {
                            include: {
                                author: true,
                                _count: { select: { likes: true, children: true } }
                            }
                        },
                        post: {
                            include: {
                                author: true,
                                _count: { select: { likes: true, comments: true } }
                            },
                        },
                        _count: { select: { children: true } }
                    }
                },
                followers: {
                    include: { follower: true },
                    where: { status: 'ACCEPTED' }
                },
                following: {
                    include: { following: true },
                    where: { status: 'ACCEPTED' }
                },
                postLikes: true,
                commentLikes: true
            }
        });

        if (!userData) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userDataWithFlag = {
            ...userData,
            posts: userData.posts.map((post) => ({
                ...post,
                isLiked: post.likes.length > 0,
            }))
        };

        const relationship = await prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: req.user.id,
                    followingId: parseInt(req.params.id)
                }
            },
            select: {
                status: true
            }
        });
        res.render('profile', { user: req.user, userData: userDataWithFlag, relationship, gravatarUrl });
    } catch (err) {
        console.error('Error getting profile', err);
        res.status(500).send('An error occurred while loading profile');
    }
}

async function postFollow(req, res) {
    if (!req.isAuthenticated()) {
        return res.redirect('/login');
    }

    try {
        await prisma.follow.create({
            data: {
                followerId: parseInt(req.user.id),
                followingId: parseInt(req.body.followingId),
                status: 'PENDING'
            }
        });

        res.redirect(`/profile/${req.body.followingId}`);
    } catch (err) {
        console.error('Error following user:', err);
        res.status(500).send('An error occurred during follow request');
    }
}

async function postUnfollow(req, res) {
    if (!req.isAuthenticated()) {
        return res.redirect('/login');
    }

    try {
        await prisma.follow.delete({
            where: {
                followerId_followingId: {
                    followerId: req.user.id,
                    followingId: parseInt(req.body.followingId),
                }
            }
        });

        res.redirect(`/profile/${req.body.followingId}`);
    } catch (err) {
        console.error('Error unfollowing:', err);
        res.status(500).send('An error occurred during unfollowing');
    }
}

async function postFollowAccept(req, res) {
    if (!req.isAuthenticated()) {
        return res.redirect('/login');
    }

    try {
        const result = await prisma.follow.updateMany({
            where: {
                followerId: parseInt(req.body.followerId),
                followingId: req.user.id,
                status: 'PENDING'
            },
            data: {
                status: 'ACCEPTED'
            }
        });

        if (result.count === 0) {
            return res.status(404).send('Follow request no longer available');
        }

        res.redirect('/notification');
    } catch (err) {
        console.error('Error accepting follow request', err);
        res.status(500).send('An error occurred during follow request');
    }
}

async function getNotification(req, res) {
    if (!req.isAuthenticated()) {
        return res.redirect('/login');
    }

    try {
        const requests = await prisma.follow.findMany({
            where: {
                followingId: parseInt(req.user.id),
                status: 'PENDING'
            },
            include: {
                follower: true
            }
        });
        res.render('notification', { user: req.user, requests: requests, gravatarUrl });
    } catch (err) {
        console.error('Error fetching follow requests:, err');
        res.status(500).send('An error occurred during loading follow requests');
    }
}

module.exports = {
    getIndex,
    getFollowingIndex,
    getLogin,
    postLogin,
    getLogout,
    getSignup,
    postSignup: [validateUser, handlePostSignup],
    getProfile,
    postFollow,
    getNotification,
    postFollowAccept,
    postUnfollow,
}