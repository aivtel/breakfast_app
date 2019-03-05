const express               = require("express");
const router                = express.Router();
const Breakfast             = require("../models/breakfast");
const Comment               = require("../models/comment");

router.get("/breakfasts/:id/comments/new", isLoggedIn, (req, res) => {
    Breakfast.findById(req.params.id, (err, foundBreakfast) => {
        err ? console.log(err) : console.log("It's fine"), 
                                 res.render("comments/new", {breakfast: foundBreakfast});
    });
   
});

router.post("/breakfasts/:id/comments", isLoggedIn, (req, res) => {
    Breakfast.findById(req.params.id, (err, foundBreakfast) => {
        err ? console.log(err) : Comment.create(req.body.comment, (err, comment) => {
            err ? console.log(err) : comment.author.id = req.user._id;
                                     comment.author.username = req.user.username;
                                     comment.save();
                                     foundBreakfast.comments.push(comment); 
                                     foundBreakfast.save(); 
                                     res.redirect("/breakfasts/" + foundBreakfast._id);
        });
    });
});

router.get("/breakfasts/:id/comments/:comment_id/edit", checkCommentOwnership, (req, res) => {
// req.params.id is refferences to :id
    Comment.findById(req.params.comment_id, (err, foundComment) => {
        err ? res.redirect("back") : res.render("comments/edit", {breakfastId: req.params.id, comment: foundComment})
    });
});

router.put("/breakfasts/:id/comments/:comment_id", checkCommentOwnership, (req, res) => {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, updatedComment) => {
        err ? res.redirect("back") : (updatedComment.save(), res.redirect("/breakfasts/" + req.params.id));
    });
});

router.delete("/breakfasts/:id/comments/:comment_id", checkCommentOwnership, (req, res) => {
    Comment.findByIdAndRemove(req.params.comment_id, (err) => {
      err ? res.redirect("/breakfasts") : res.redirect("/breakfasts/" + req.params.id);
    });
});

function isLoggedIn(req, res, next) {
    req.isAuthenticated() ? next() : (req.flash("error", "You need to be logged in"), res.redirect("/login"));
};


function checkCommentOwnership (req, res, next){
        if (req.isAuthenticated()){
        Comment.findById(req.params.comment_id, (err, foundComment) => {
        if (err) {
            console.log(err), res.redirect("back");
        } else {
 // foundBreakfast.author.id is a mongoose OBJECT not a string, so we can't compare it with req.user._id by ===
                if (foundComment.author.id.equals(req.user._id)) {
                         next();
                } else { res.redirect("back");
                    }
            };
        }); 
    } else { res.redirect("back");}
};

module.exports = router;