var express = require("express"),
    Campground = require("../models/campground.js"),
    Comment = require("../models/comment.js"),
    middleware = require("../middleware"),
    // mergeParams allows us to get id from app.js's routing configs 
    router  = express.Router({mergeParams: true});
// =============================================================
// COMMENTS ROUTES
// =============================================================

// NEW -- show form for creating comment
router.get("/new", middleware.isLoggedIn, function(req, res) {
    Campground.findById(req.params.id, function(err, foundCampground){
        if(err){
            console.log(err);
        } else {
            res.render("comments/new",{campground:foundCampground});
        }
    });
});

// CREATE -- Add new comment to db and associate to campground
router.post("/",middleware.isLoggedIn, function(req, res){
    // lookup campground using ID
    Campground.findById(req.params.id, function(err, foundCampground) {
        if(err) {
            console.log(err);
        } else {
            // create new comment
            Comment.create(req.body.comment, function(err, newComment){
                if(err){
                    req.flash("error", "Something Went Wrong");
                    console.log(err);
                } else {
                    // Associate username and id to commment
                    newComment.author.id = req.user._id;
                    newComment.author.username = req.user.username;
                    // save comment
                    newComment.save();
                    // connect new comment to compground
                    foundCampground.comments.push(newComment);
                    foundCampground.save();
                    // redirect to campground show page
                    req.flash("success", "Successflully added comment");
                    res.redirect("/campgrounds/"+ foundCampground._id);
                }
            });
        }
    });
});

// EDIT - Show edit comment form of one campground
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
    // get the specific comment from comment_id 
    Comment.findById(req.params.comment_id, function(err, foundComment) {
        if(err) {
            console.log(err);
            res.redirect("back");
        } else {
            // render the edit form for that comment
            res.render("comments/edit", {comment: foundComment, campground_id: req.params.id});
        }
    });
});

// UPDATE - Handle comment Update request
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    // Find that comment with id and update with request' data
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, {new: true}, function(err, updatedComment){
        if(err) {
            console.log(err);
            res.redirect("back");
        } else {
            req.flash("success", "successfully Updated Comment");
            res.redirect("/campgrounds/"+ req.params.id);
        }
    });
});

// DESTORY - Handle a delete request to delete a specific comment
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err) {
            console.log(err);
            req.flash("error", "Something went wrong when deleting Comment ");
            res.redirect("back");
        } else {
            req.flash("success", "successfully Deleted Comment");
            res.redirect("/campgrounds/"+ req.params.id);
        }
    });
});


module.exports = router;
