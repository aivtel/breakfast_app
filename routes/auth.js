const express               = require("express");
const router                = express.Router();
const User                  = require("../models/user");
const passport              = require("passport");

router.get("/", (req, res) => {
   res.redirect("/breakfasts"); 
});


router.get("/register", (req, res) => {
    res.render("register");
});

router.post("/register", (req, res) => {
    User.register(new User({username: req.body.username}), req.body.password, (err, newUser) => {
        err ? res.render("register", {"error": err.message}) : passport.authenticate("local")(req, res, () => {
            res.redirect("/breakfasts");
        });
    });
});


router.get("/login", (req, res) => {
    res.render("login");
});

router.post("/login", passport.authenticate("local", 
                    {  successRedirect: "/breakfasts",
                       failureRedirect: "/login"
                    }), (req, res) => {
    
});


router.get("/logout", (req, res) => {
    req.logout(); 
    req.flash("success", "You logged out");
    res.redirect("/breakfasts");
});


function isLoggedIn(req, res, next) {
    req.isAuthenticated() ? next() : (req.flash("error", "You need to be logged in"), res.redirect("/login"));
};

module.exports = router;


