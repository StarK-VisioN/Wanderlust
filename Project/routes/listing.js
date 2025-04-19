const express = require("express");
const router = express.Router();        // Creates new Router object
const wrapAsync = require("../utils/wrapAsync.js");                      // requiring error class in server
const Listing = require("../models/listing.js"); 
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");

const listeningController = require("../controllers/listings.js");
const multer  = require('multer')
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage });

// Router.route
// combining -> Index & Create route  "/"
router.route("/")
.get(wrapAsync(listeningController.index))
.post(isLoggedIn, upload.single('listing[image]'),validateListing, wrapAsync(listeningController.createListing));


// New route 
router.get("/new", isLoggedIn, listeningController.renderNewForm);

// combining -> Show, Update, Delete route  "/:id"
router.route("/:id")
.get(wrapAsync(listeningController.showListing))
.put(isLoggedIn, isOwner,upload.single('listing[image]'), validateListing, wrapAsync(listeningController.updateListing))
.delete(isLoggedIn, isOwner, wrapAsync(listeningController.destroyListing));


// Edit route 
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listeningController.renderEditForm));

module.exports = router;

/*

// Index route 
router.get("/", wrapAsync(listeningController.index));

// Show route
router.get("/:id", wrapAsync(listeningController.showListing));

// Create route 
router.post("/",isLoggedIn, validateListing, wrapAsync(listeningController.createListing));

// Update route
router.put("/:id",isLoggedIn, isOwner, validateListing, wrapAsync(listeningController.updateListing));

// Delete route
router.delete("/:id",isLoggedIn, isOwner, wrapAsync(listeningController.destroyListing));

*/

