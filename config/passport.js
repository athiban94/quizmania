var passport = require('passport');
var User = require('../models/user');
var LocalStrategy = require('passport-local').Strategy;

// This will basically tell how to store the user in the session
passport.serializeUser(function(user,done) {
    done(null, user.id);
});

// This will allow to retrive the user from the session
passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

passport.use('local.signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function(req, email, password, done){
    req.checkBody('email', 'Invalid Email').notEmpty().isEmail();
    req.checkBody('password', 'Invalid Password').notEmpty().isLength({min: 4});
    var errors = req.validationErrors();
    if(errors) {
        var messages = [];
        errors.forEach(function(error){
            messages.push(error.msg);
        });
        return done(null, false, req.flash('error', messages));
    }
    User.findOne({'email': email}, function(err, user) {
        console.log("Inside the find one");
        if(err) {
            console.log("Inside two : "+err);
            return done(err);
        }
        if(user) {
            console.log("Email already in use");
            return done(null, false, {message: "Email is already in use."});
        }
        var newUser = new User();
        newUser.email = email;
        newUser.password = newUser.encryptPassword(password);
        newUser.save(function(err, result) {
            if(err) {
                console.log("Inside three : " + err);
                return done(err);
            }
            console.log("New user is :: " + newUser);
            return done(null, newUser);
        });
    });
}));

passport.use('local.signin', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true

}, function(req, email, password, done) {
    req.checkBody('email', 'Invalid Email').notEmpty().isEmail();
    req.checkBody('password', 'Invalid Password').notEmpty();
    var errors = req.validationErrors();
    if(errors) {
        var messages = [];
        errors.forEach(function(error){
            messages.push(error.msg);
        });
        return done(null, false, req.flash('error', messages));
    }
    User.findOne({'email': email}, function(err, user) {
        console.log("Inside the find one");
        if(err) {
            console.log("Inside two : "+err);
            return done(err);
        }
        if(!user) {
            return done(null, false, {message: "No user found."});
        }
        if(!user.validPassword(password)) {
            return done(null, false, {message: "Passwords didn't match"});
        }
        return done(null, user);
    });
}));