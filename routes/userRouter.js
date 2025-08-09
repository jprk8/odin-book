const { Router } = require('express');
const userController = require('../controllers/userController');
const userRouter = Router();

userRouter.get('/', userController.getIndex);
userRouter.get('/following', userController.getFollowingIndex);
userRouter.get('/login', userController.getLogin);
userRouter.post('/login', userController.postLogin);
userRouter.get('/logout', userController.getLogout);
userRouter.get('/signup', userController.getSignup);
userRouter.post('/signup', userController.postSignup);
userRouter.get('/profile/:id', userController.getProfile);
userRouter.post('/follow', userController.postFollow);
userRouter.post('/follow/accept', userController.postFollowAccept);
userRouter.post('/unfollow', userController.postUnfollow);
userRouter.get('/notification', userController.getNotification);

module.exports = userRouter;