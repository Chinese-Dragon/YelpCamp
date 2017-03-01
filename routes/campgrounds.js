var express = require("express"),
    Campground = require("../models/campground.js"), // instance of campground table
    // if say requre /middleware we automatically take index.js
    middleware = require("../middleware"),
    router  = express.Router();

// INDEX - list all campgrounds
router.get("/", function(req, res){
    // Get all campgrounds from DB
    Campground.find({}, function(err, campgrounds){
        if(err){
            console.log("OH NO Error!");
            console.log(err);    
        } else {
            res.render("campgrounds/index",{campgrounds:campgrounds});
        }
    });
});

// NEW - show form for creating campground
router.get("/new", middleware.isLoggedIn, function(req, res) {
   res.render("campgrounds/new");
});

// CREATE - Add campground to db
// Actually it follows REST convention that direct get/post to the same name
router.post("/", middleware.isLoggedIn, function(req, res){
    // add new campground data to DB
    Campground.create(req.body.campgroundData, function(err, newCampground){
        if(err) {
            console.log("Opps there is an error");
            console.log(err);
            // there should be a flashMessage to notify user
            res.redirect("/campgrounds");
        } else {
            newCampground.author.id         = req.user._id;
            newCampground.author.username   = req.user.username;
            newCampground.save();
            console.log("We successfully saved a campground to DB");
            console.log(newCampground);
            
            // redirect to campgrounds page (the one above)
            // the default request of redirect is GET
            res.redirect("/campgrounds");
        }
    });

});

// SHOW - Show info about one campground
router.get("/:id", function(req, res) {
    // find the campground with provided ID and populate its associated comments
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground) {
        if(err){
            console.log(err);
        } else {
            // render show template with that campground
            res.render("campgrounds/show", {campground:foundCampground});
        }
    });
});

// EDIT - Show Edit form about one campground
router.get("/:id/edit", middleware.checkCampgroundOwnership,function(req, res) {
    // get a specific campground from db using id
    Campground.findById(req.params.id, function(err, foundCampground){
        if(err){
            console.log(err);
            req.flash("error", "Campground not found");
            res.redirect("back");
        } else {
            // render the edit form page with data passed to it
            res.render("campgrounds/edit", {campground:foundCampground});
        }
    });
});

// UPDATE - Handle Update request
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
    // find that campground with id and update with request' data
    Campground.findByIdAndUpdate(req.params.id, req.body.campgroundData, {new: true}, function(err, updatedCampground){
        if(err){
            console.log(err);
            res.redirect("back");
        } else {
            req.flash("success", "Successflully Updated Campground");
            res.redirect("/campgrounds/"+ updatedCampground._id);
        }
    });
});

// DESTROY - Handle Delete request
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findByIdAndRemove(req.params.id, function(err){
        if(err){
            console.log(err);
            res.redirect("/campgrounds");
        } else {
            req.flash("success", "Successflully Deleted Campground");
            res.redirect("/campgrounds");
        }
    });
});

module.exports = router;