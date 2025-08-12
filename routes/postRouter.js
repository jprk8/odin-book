const { Router } = require('express');
const postController = require('../controllers/postController');
const postRouter = Router();

postRouter.post('/newpost', postController.postNewPost);
postRouter.post('/toggle-like', postController.postToggleLike);
postRouter.post('/toggle-like-comment', postController.postToggleLikeComment);
postRouter.get('/:id', postController.getPost);
postRouter.post('/newcomment', postController.postNewComment);

module.exports = postRouter;