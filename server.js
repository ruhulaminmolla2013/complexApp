const express = require("express");
const session = require('express-session')
const flash = require('connect-flash')
const app = express()

app.use(session({
    secret: 'I am New In This Field',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60,
        httpOnly: true
    }
}))

app.use(flash())

app.use((req, res, next) => {

    //Check current visitor is owoner of the post
    if (req.session.user) { req.visitorId = req.session.user._id } else { req.visitorId = 0 }

    // makesession available for all rouetes
    res.locals.user = req.session.user
    next()
})

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("public"));

// set view folder
app.set("views", "views");
app.set("view engine", "ejs");

//router setup
const router = require("./router");
app.use("/", router);

module.exports = app
