const mongoose = require("mongoose");

const breakfastSchema = new mongoose.Schema({
    name: String,
    image: String,
    description: String,
    coordinates: Array,
    price: Number,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ]
    
});

const Breakfast = mongoose.model("Breakfast", breakfastSchema);

module.exports = Breakfast;