var express = require("express"),
    router  = express.Router(),
    User    = require("../models/user.js"),
    passport = require("passport");

// routes 
router.get("/", function(req, res){
   res.render("landing");
});

// =========================================================
// AUTH ROUTES
// =========================================================

// show register form
router.get("/register", function(req, res) {
    res.render("register");
});

// handle register info and save into db
router.post("/register", function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    
    User.register(new User({username:username}), password, function(err, newUser){
        if(err) {
            console.log(err);
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            // autimatically login new user
            passport.authenticate("local")(req, res, function(){
                req.flash("success", "Welcome to YelpCamp " + newUser.username);
                res.redirect("/campgrounds");
            });
        }
    });
});

// render login form
router.get("/login", function(req, res) {
    res.render("login");
});

// handle login in request
router.post("/login", passport.authenticate("local",{
    successRedirect: "/campgrounds",
    failureRedirect: "/login",
    failureFlash: "Wrong Username or Password" 
}),function(req, res) {
});

router.get("/logout", function(req, res) {
    req.logout();
    req.flash("success","Logged out");
    res.redirect("/campgrounds");
});

module.exports = router;