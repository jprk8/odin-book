const { Router } = require('express');
const postController = require('../controllers/postController');
const postRouter = Router();

postRouter.post('/newpost', postController.postNewPost);

module.exports = postRouter;