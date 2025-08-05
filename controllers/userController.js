const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const passport = require('passport');
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
    body('lastName').trim()
        .isAlpha().withMessage(`Last name ${alphaErr}`)
        .isLength({ min: 1, max: 40 }).withMessage(`Last name ${lengthErr}`)
        .customSanitizer((name) => name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()),
    body('username').trim()
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
    body('confirmPassword')
        .custom((value, { req }) => value === req.body.password)
        .withMessage('Passwords do not match')
]

async function getPosts() {
    return prisma.post.findMany({
        where: { published: true },
        orderBy: { createdAt: 'desc' },
        include: {
            author: true,
            topic: true,
            comments: true,
            likes: true
        }
    });
}

async function getIndex(req, res) {
    if (!req.isAuthenticated()) {
        return res.redirect('/login');
    }

    try {
        const posts = await getPosts();
        res.render('index', { user: req.user, posts: posts });
    } catch (err) {
        console.error('Error loading posts', err);
        res.status(500).send('Failed to load posts');
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
        await prisma.user.create({
            data: {
                username: req.body.username,
                firstName: req.body.firstName,
                lastName: req.body.lastName || null,
                password: hashedPassword,
                profile: {
                    create: {}
                }
            }
        });
        console.log('Registration success');
        res.redirect('/');
    } catch (err) {
        console.error('Error creating user with prisma:', err);
        res.status(500).send('An error occurred during registration');
    }
}

module.exports = {
    getIndex,
    getLogin,
    postLogin,
    getLogout,
    getSignup,
    postSignup: [validateUser, handlePostSignup],
}