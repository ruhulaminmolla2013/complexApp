const Post = require('../model/postModel')
const postCollection = require('../db').db().collection('Posts')

exports.createPostScreen = (req, res) => {
    res.render('createPost')
}

exports.createPost = (req, res) => {
    let post = new Post(req.body, req.session.user._id)
    post.createNewPost().then((result) => {
        console.log("Post Details: " + result)
        res.render('singlePostViewScreen', { title: result.title, content: result.body, author: result.author })
    }).catch((e) => {

        res.send(e)
    })
}

exports.allPosts = function (req, res) {
    Post.searchPostByAuthor(req.session.user._id).then((posts) => {
        res.render('profile-posts', { Posts: posts })
    }).catch(() => {
        res.redirect("/")
    })
}

exports.singlePost = function (req, res) {
    Post.singlePostView(req.params.id).then((post) => {
        res.render('singlePostViewScreen', { post: post })
    }).catch(() => {
        res.render('404')
    })
}

exports.postEditScreen = function (req, res) {
    Post.viewEditScreen(req.params.id).then((post) => {
        res.render('edit-post', { post: post })
    }).catch(() => {
        res.render('404')
    })
}

exports.updatePost = function (req, res) {
    let post = new Post(req.body, req.visitorId, req.params.id)
    post.updatePost().then((updatePost) => {
        res.redirect(`/posts/${req.params.id}`)
    }).catch(() => {
        console.log('Error from create new Post: ')
        res.render('404')
    })
}