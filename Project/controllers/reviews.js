const Review = require("../models/review.js"); 
const Listing = require("../models/listing.js"); 


module.exports.createReview = async(req, res) => {         // removed -> /listings/:id/reviews
    let listing = await Listing.findById(req.params.id);        // accessing the listing of which the ID is provided in URL
    let newReview = new Review(req.body.review);                // passing the form details to backend

    newReview.author = req.user._id;                            // adding author ID to new Review

    listing.reviews.push(newReview);                            // pushing the reviews inside listing
    await newReview.save();
    await listing.save();

    req.flash("success", "New Review Created!");    
    res.redirect(`/listings/${listing._id}`);
}

module.exports.destroyReview = async(req, res) => {
    let {id, reviewId} = req.params;
    
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);

    req.flash("success", "Review Deleted!");    
    res.redirect(`/listings/${id}`);
}
