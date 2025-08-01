const { Router } = require('express');
const userController = require('../controllers/userController');
const userRouter = Router();

userRouter.get('/', userController.getIndex);
userRouter.get('/login', userController.getLogin);
userRouter.post('/login', userController.postLogin);
userRouter.get('/logout', userController.getLogout);
userRouter.get('/signup', userController.getSignup);
userRouter.post('/signup', userController.postSignup);

module.exports = userRouter;