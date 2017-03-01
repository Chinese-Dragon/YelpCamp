var express                 = require("express"),
    app                     = express(),
    bodyParser              = require("body-parser"),
    mongoose                = require("mongoose"),
    passport                = require("passport"),
    methodOverride          = require("method-override"),
    localStrategy           = require("passport-local"),
    flash                   = require("connect-flash"),
    Session                 = require("express-session"),           
    User                    = require("./models/user");
    // seedDB                  = require("./seeds");
   
// Require routes
var commentRoutes = require("./routes/comments"),
    campgroundRoutes = require("./routes/campgrounds"),
    authRoutes = require("./routes/index");


// APP CONFIG
// mongoose.connect("mongodb://localhost/yelp_camp");
mongoose.connect("mongodb://fool:64a06b09c@ds139939.mlab.com:39939/node_yelp_camp");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname + "/public")); //NOTE: using __dirname to avoid change of current dir
app.set("view engine","ejs");
app.use(methodOverride("_method")); // tell it to look for "_method" in url
app.use(flash());

// seedDB(); //seed the databse

// PASSPORT CONFIG
app.use(Session({
    secret:"Stay Hungry Stay Foolish",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

// Config routes
app.use("/", authRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);

// 
app.listen(process.env.PORT, process.env.IP, function() {
    console.log("Server is running");
});