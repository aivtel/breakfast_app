require('dotenv').config();

const express               = require("express");
const router                = express.Router();
const Breakfast             = require("../models/breakfast");

const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const geocodingClient = mbxGeocoding({ accessToken: process.env.MAPBOX_TOKEN});

router.get("/breakfasts", (req, res) => {
    Breakfast.find({}, (err, breakfasts) =>{
        err ? console.log(err): res.render("breakfasts/index", {breakfasts: breakfasts});
    });
    
});

router.post("/breakfasts", isLoggedIn, async (req, res) => {
    
// =============================================
    let response = await geocodingClient
                        .forwardGeocode({
                            query: req.body.breakfast.location,
                            limit: 1
                            })
                        .send();

// =====================================================
    
    var name = req.body.breakfast.name;
    var image = req.body.breakfast.image;
    var desc = req.body.breakfast.description;
    var coordinates = response.body.features[0].geometry.coordinates;
    var price = req.body.breakfast.price;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    var newBreakfast = {name: name, image: image, description: desc, author: author, coordinates: coordinates, price: price};
    Breakfast.create(newBreakfast, (err, breakfast) => {
        err ? console.log(err) : console.log("It's Fine!");
    });
    res.redirect("/breakfasts");
});

router.get("/breakfasts/new", isLoggedIn, (req, res) => {
   res.render("breakfasts/new"); 
});

router.get("/breakfasts/:id", (req, res) => {
    Breakfast.findById(req.params.id).populate("comments").exec((err, foundBreakfast) => {
        err ? console.log(err) : res.render("breakfasts/show", {breakfast: foundBreakfast});
    });
});

router.get("/breakfasts/:id/edit", checkOwnershipBreakfast, (req, res) => {
        Breakfast.findById(req.params.id, (err, foundBreakfast) => {
                         err ? console.log(err) : res.render("breakfasts/edit", {breakfast: foundBreakfast})
        });
});

router.put("/breakfasts/:id", checkOwnershipBreakfast, async (req, res) => {
    // =================================
        let response = await geocodingClient
                        .forwardGeocode({
                            query: req.body.breakfast.location,
                            limit: 1
                            })
                        .send();
    // ==============================
    
        var name = req.body.breakfast.name;
        var image = req.body.breakfast.image;
        var desc = req.body.breakfast.description;
        var coordinates = response.body.features[0].geometry.coordinates;
        var price = req.body.breakfast.price;
        var author = {
            id: req.user._id,
            username: req.user.username
            };
        var updBreakfast = {name: name, image: image, description: desc, author: author, coordinates: coordinates, price: price};
    
    Breakfast.findByIdAndUpdate(req.params.id, updBreakfast, (err, updatedBreakfast) =>{
        err ? (console.log(err), res.redirect("/breakfasts")) : res.redirect("/breakfasts/" + updatedBreakfast._id), console.log(updatedBreakfast.coordinates);
    });
});

router.delete("/breakfasts/:id", checkOwnershipBreakfast, (req, res) => {
    Breakfast.findByIdAndRemove(req.params.id, (err) => {
       err ? res.redirect("/breakfasts") : res.redirect("/breakfasts"); 
    });
});

function isLoggedIn(req, res, next) {
    req.isAuthenticated() ? next() : (req.flash("error", "You need to be logged in"), res.redirect("/login"));
};

function checkOwnershipBreakfast (req, res, next){
        if (req.isAuthenticated()){
        Breakfast.findById(req.params.id, (err, foundBreakfast) => {
        if (err) {
            console.log(err), res.redirect("back");
        } else {
                if (!foundBreakfast) {
                    req.flash("error", "Item not found.");
                    return res.redirect("back");
                }
 // foundBreakfast.author.id is a mongoose OBJECT not a string, so we can't compare it with req.user._id by ===
                if (foundBreakfast.author.id.equals(req.user._id)) {
                         next();
                } else { res.redirect("back");
                    }
            };
        }); 
    } else {    req.flash("error", "You need to be logged in");
                res.redirect("back");}
};

module.exports = router;