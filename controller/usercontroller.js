const User = require('../model/userModel')
const userCollection = require('../db').db().collection('Users')

exports.mustBeLogin = function (req, res, next) {
  if (req.session.user) {
    next()
  } else {
    req.flash('Errors', 'You must be logged in to perform this action.')
    res.redirect('/')
  }
}

exports.home = function (req, res) {
  let user = req.session.user
  if (user) {
    res.render('home-dashboard')
  } else {
    res.render('home-guest', { RegErrors: req.flash('RegErrors'), Errors: req.flash('Errors') })
  }
};

exports.register = async function (req, res) {
  let user = new User(req.body)
  user.register().then((result) => {
    req.session.user = { username: user.data.username, _id: user.data._id, avator: user.getAvator }
    res.redirect('/')
  }).catch((regErrors) => {
    console.log(regErrors)
    regErrors.forEach(function (error) {
      req.flash('RegErrors', error)
    })
    res.redirect('/')
  })
}

exports.login = function (req, res) {
  let user = new User(req.body)
  user.login().then((result) => {
    req.session.user = { username: result.username, _id: result._id }
    res.redirect('/')
  }).catch((loginError) => {
    loginError.forEach(function (error) {
      req.flash('Errors', error)
    })
    console.log(loginError)
    res.redirect('/')
  })

}

exports.logout = function (req, res) {
  req.session.destroy(() => {
    res.redirect('/')
  })
}