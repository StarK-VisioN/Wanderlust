const Listing = require("./models/listing");
const Review = require("./models/review");
const {listingSchema, reviewSchema} = require("./Schema.js");
const ExpressError = require("./utils/ExpressError.js")

module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {                    // Checks if the user is logged in, if not then following are the steps :- Saves the URL etc.
        // redirectUrl save  ->      Save the URL the user is trying to access (to redirect after login)
        req.session.redirectUrl = req.originalUrl;

        req.flash("error", "you must be logged in to create listing!");
        return res.redirect("/login");
    }
     // If user is authenticated, proceed
    next();
}

module.exports.saveRedirectUrl = (req, res, next) => {
    if(req.session.redirectUrl) {                           // if any redirectUrl is saved under "req sessions" then
        res.locals.redirectUrl = req.session.redirectUrl;       // save it to "response locals"
    }
    next();
}


module.exports.isOwner = async(req, res, next) => {
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner._id.equals(res.locals.currUser._id)) {
        req.flash("error", "You are not the owner of this listing");
        return res.redirect(`/listings/${id}`);
    }
    next();
}

module.exports.isReviewAuthor = async(req, res, next) => {
    let {id, reviewId} = req.params;
    let review = await Review.findById(reviewId);
    if(!review.author._id.equals(res.locals.currUser._id)) {
        req.flash("error", "You are not the author of this review");
        return res.redirect(`/listings/${id}`);
    }
    next();
}

module.exports.validateListing = (req, res, next) => {
    let {error} = listingSchema.validate(req.body);
    if(error) {
        throw new ExpressError(400, error);
    } else {
        next();
    }
}

module.exports.validateReview = (req, res, next) => {
    let {error} = reviewSchema.validate(req.body);
    if(error) {
        throw new ExpressError(400, error);
    } else {
        next();
    }
}