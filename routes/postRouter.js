const { Router } = require('express');
const postController = require('../controllers/postController');
const postRouter = Router();

postRouter.post('/newpost', postController.postNewPost);
postRouter.post('/toggle-like', postController.postToggleLike);

module.exports = postRouter;