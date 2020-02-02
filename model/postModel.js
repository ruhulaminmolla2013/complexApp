const sanitizeHTML = require('sanitize-html')
const objectID = require('mongodb').ObjectId
const postCollection = require('../db').db().collection('Posts')


const Post = function (data, userId, requestedPostId) {
    this.data = data
    this.errors = []
    this.userId = userId
    this.requestedPostId = requestedPostId
}

Post.prototype.cleanUp = function () {
    if (typeof (this.data.title) != 'string') { this.data.title = '' }
    if (typeof (this.data.body) != 'string') { this.data.body = '' }

    this.data = {
        title: sanitizeHTML(this.data.title.trim(), { allowedTags: [], allowedAttributes: {} }),
        body: sanitizeHTML(this.data.body.trim(), { allowedTags: [], allowedAttributes: {} }),
        createdDate: new Date(),
        author: objectID(this.userId)
    }
}

Post.prototype.validate = function () {
    return new Promise((resolve, reject) => {
        if (this.data.title == '') { this.errors.push('Please provide a title') }
        if (this.data.body == '') { this.errors.push('Please provide a Content') }
        resolve()
    })
}


Post.prototype.createNewPost = function () {
    return new Promise(async (resolve, reject) => {
        this.cleanUp()
        await this.validate()
        postCollection.insertOne(this.data).then((info) => {
            resolve(info.ops[0])
        }).catch(() => {
            reject("Sorry! Please try again later.")
        })
    })
}

Post.prototype.updatePost = function () {
    return new Promise(async (resolve, reject) => {
        this.cleanUp()
        await this.validate()
        let post = await Post.findByPostId(this.requestedPostId)
        if (post.author._id = this.userId) {
            postCollection.findOneAndUpdate({ _id: new objectID(this.requestedPostId) }, { $set: { title: this.data.title, body: this.data.body } }).then((info) => {
                resolve(info.ops[0])
                return
            }).catch(() => {
                reject("Sorry! Please try again later.")
            })
        } else {
            reject()
        }
    })
}

Post.databaseQuery = function (uniqOperation) {
    return new Promise(async (resolve, reject) => {
        let aggregateOption = uniqOperation.concat([
            { $lookup: { from: "Users", localField: "author", foreignField: "_id", as: "authorDocument" } },
            {
                $project: {
                    title: 1,
                    body: 1,
                    createdDate: 1,
                    authorId: "$author",
                    _id: 1,
                    author: { $arrayElemAt: ["$authorDocument", 0] }
                }
            }
        ])
        let posts = await postCollection.aggregate(aggregateOption).toArray()
        resolve(posts)
    })
}

Post.searchPostByAuthor = function (userID) {
    return new Promise(async (resolve, reject) => {
        let posts = await Post.databaseQuery([
            { $match: { author: new objectID(userID) } },
            { $sort: { createdDate: -1 } }
        ])

        if (posts.length) {
            console.log(posts[0])
            resolve(posts)
        } else {
            reject()
        }

    })
}

Post.singlePostView = function (postId) {
    return new Promise(async (resolve, reject) => {
        let posts = await Post.databaseQuery([
            { $match: { _id: new objectID(postId) } }
        ])

        if (posts.length) {
            console.log(posts[0])
            resolve(posts[0])
        } else {
            reject()
        }
    })
}

Post.viewEditScreen = function (postID) {
    return new Promise(async (resolve, reject) => {
        let posts = await Post.databaseQuery([
            { $match: { _id: new objectID(postID) } }
        ])

        if (posts.length) {
            console.log(posts[0])
            resolve(posts[0])
        } else {
            reject()
        }
    })
}

Post.findByPostId = function (id) {
    return new Promise(async (resolve, reject) => {
        let posts = await Post.databaseQuery([
            { $match: { _id: new objectID(id) } }
        ])
        resolve(posts[0])
    })
}

module.exports = Post