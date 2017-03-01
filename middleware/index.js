var Campground  = require("../models/campground"),
    Comment     = require("../models/comment"); 
// all the middleware goes here

// define an empty object first 
var middlewareObj = {};

middlewareObj.checkCampgroundOwnership = function(req, res, next) {
    // check if user already signed in
    if(req.isAuthenticated()) {
        // found the campground user is dealing with
        Campground.findById(req.params.id, function(err, foundCampground) {
            if(err) {
                console.log(err);
                req.flash("error", "Campground not found");
                res.redirect("back");
            } else {
                // check if the user has permission
                if(foundCampground.author.id.equals(req.user._id)) {
                    // permission granted
                    return next();
                } else {
                    req.flash("error","You don't have permission to do that");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error","You need to be logged to do that");
        res.redirect("back");
    }
};

middlewareObj.checkCommentOwnership = function(req, res, next) {
    //check if user already signed in
    if (req.isAuthenticated()) {
        // Found the comment user is dealing with
        Comment.findById(req.params.comment_id, function(err, foundComment) {
            if(err){
                console.log(err);
                req.flash("error", "Comment not found");
                res.redirect("back");
            } else {
                // check if current user has permission
                if(foundComment.author.id.equals(req.user._id)) {
                    return next();
                } else {
                    req.flash("You don't have permission to do that");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error","You need to be logged to do that");
        res.redirect("back");
    }
};

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    } else {
        req.flash("error", "You need to be logged in to do that"); 
        res.redirect("/login");
    }
};


module.exports = middlewareObj;