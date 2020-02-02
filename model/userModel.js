const bcrypt = require('bcryptjs')
const userCollection = require('../db').db().collection('Users')
const validator = require('validator')
const md5 = require('md5')


let User = function (data) {
    this.data = data
    this.errors = []
}

User.prototype.cleanUp = function () {
    if (typeof (this.data.username) != 'string') { this.data.username = '' }
    if (typeof (this.data.email) != 'string') { this.data.email = '' }
    if (typeof (this.data.password) != 'string') { this.data.password = '' }

    // get rid of any bogus component
    this.data = {
        username: this.data.username.trim().toLowerCase(),
        email: this.data.email.trim().toLowerCase(),
        password: this.data.password
    }
}

User.prototype.validate = function () {
    return new Promise(async (resolve, reject) => {
        if (this.data.username == "") { this.errors.push("You must provide a username.") }
        if (this.data.username != "" && !validator.isAlphanumeric(this.data.username)) { this.errors.push("Username can only contain letters and numbers.") }
        if (!validator.isEmail(this.data.email)) { this.errors.push("You must provide a valid email address.") }
        if (this.data.password == "") { this.errors.push("You must provide a password.") }
        if (this.data.password.length > 0 && this.data.password.length < 6) { this.errors.push("Password must be at least 12 characters.") }
        if (this.data.password.length > 50) { this.errors.push("Password cannot exceed 50 characters.") }
        if (this.data.username.length > 0 && this.data.username.length < 3) { this.errors.push("Username must be at least 3 characters.") }
        if (this.data.username.length > 30) { this.errors.push("Username cannot exceed 30 characters.") }

        // Only if username is valid then check to see if it's already taken
        if (this.data.username.length > 2 && this.data.username.length < 31 && validator.isAlphanumeric(this.data.username)) {
            let usernameExists = await userCollection.findOne({ username: this.data.username })
            if (usernameExists) { this.errors.push("That username is already taken.") }
        }

        // Only if email is valid then check to see if it's already taken
        if (validator.isEmail(this.data.email)) {
            let emailExists = await userCollection.findOne({ email: this.data.email })
            if (emailExists) { this.errors.push("That email is already being used.") }
        }
        resolve()
    })
}

User.prototype.register = function () {
    return new Promise(async (resolve, reject) => {
        await this.cleanUp()
        await this.validate()
        if (!this.errors.length) {
            const salt = bcrypt.genSaltSync(10)
            this.data.password = bcrypt.hashSync(this.data.password, salt)
            userCollection.insertOne(this.data).then(info => {
                this.getAvator()
                resolve(info.ops[0])
            }).catch((e) => {
                reject([e])
            })
        } else {
            reject(this.errors)
        }
    })
}

User.prototype.login = function () {
    return new Promise(async (resolve, reject) => {
        await this.cleanUp()
        if (!this.data.username || !this.data.password) {
            this.errors.push('Please enter Username and Password')
            reject(this.errors)
            return
        }
        if (userCollection != null) {
            await userCollection.findOne({ username: this.data.username }).then((attemptUser) => {
                if (attemptUser && bcrypt.compareSync(this.data.password, attemptUser.password)) {
                    this.getAvator()
                    resolve(attemptUser)
                } else {
                    this.errors.push('Sorry!, Username/Password not found')
                    reject(this.errors)
                }
            }).catch((e) => {
                this.errors.push([e])
                reject(this.errors)
                return
            })
        } else {
            reject(['Sorry! please Try again later'])
            return
        }
    })
}

User.prototype.getAvator = function () {
    this.avatar = `https://gravatar.com/avatar/${md5(this.data.email)}?s=128`
}

module.exports = User