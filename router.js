const express = require("express");
const router = express.Router();
const userController = require("./controller/usercontroller");
const postController = require("./controller/postController");

// user related router
router.get("/", userController.home);
router.post('/register', userController.register)
router.post('/login', userController.login)
router.post('/logout', userController.logout)

// Post related route
router.get("/createPost", userController.mustBeLogin, postController.createPostScreen);
router.post("/createPost", postController.createPost);
router.get('/posts', userController.mustBeLogin, postController.allPosts)
router.get('/posts/:id', userController.mustBeLogin, postController.singlePost)
router.get('/posts/:id/edit', userController.mustBeLogin, postController.postEditScreen)
router.post('/posts/:id/edit', userController.mustBeLogin, postController.updatePost)


module.exports = router;
