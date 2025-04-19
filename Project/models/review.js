const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema({               // made new Schema for reviews & below listing page we should get all reviews 
    comment: String,                            // so we made new field in listing.js too
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    author : {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
});

module.exports = mongoose.model("Review", reviewSchema);