const Listing = require("../models/listing.js"); 
// requiring mapbox sdk used to convert Locations to Cordinates
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');              // requiring service of geocoding
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });                    // starting the service by passing our access token


module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});                 // Fetch all documents from the Listing model and store them in the allListings variable
    res.render("./listings/index.ejs", { allListings });
}

module.exports.renderNewForm = (req, res) => {
    res.render("./listings/new.ejs")
}

module.exports.showListing = async(req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id).populate({path: "reviews", populate:{path: "author"},}).populate("owner");             // on the basis of ID will get the complete Listing data -> which we will store in 'listing'
    if(!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");    
    }
    res.render("./listings/show.ejs", {listing});                      // and will pass this variable 'listing' in show.ejs
}

module.exports.createListing = async(req, res, next) => {                  // as we are going to make changes in DB so need to wait until data is not inserted     So used async
    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,                               // inside listing we need location coordinates
        limit: 1,
      })
        .send();
        

    let url = req.file.path;
    let filename = req.file.filename;
   
    const newListing = new Listing(req.body.listing);                         // as we make objects of those listings
    newListing.owner = req.user._id;
    newListing.image = {url, filename};

    newListing.geometry = response.body.features[0].geometry;               // value is coming from mapbox & getting stored in 'newListing' key
                                                        // here, feature is in array inside which we have object, so we used [0] i.e. 0th o
    let savedListing = await newListing.save();
    console.log(savedListing);
    
    req.flash("success", "New Listing Created!");           // used flash 
    res.redirect("/listings");
}

module.exports.renderEditForm = async(req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");    
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");          // to resize the uploaded image
    res.render("./listings/edit.ejs", { listing, originalImageUrl });
}

module.exports.updateListing = async(req, res) => {
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});     // {...req.body.listings}  -> we are going to deconstruct the values of object to get individual key-values & add them individually in DB
    
    if(typeof req.file !== "undefined") {                // if we dont upload the file then dont perform these operations
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {url, filename};
        await listing.save();
    }
     
    req.flash("success", "Listing Updated!");    
    res.redirect(`/listings/${id}`);          // to our show route   "/listings/:id"
}

module.exports.destroyListing = async(req, res) => {                    // making changes in DB so need to use async function
    let {id} = req.params;
    const deletedListings = await Listing.findByIdAndDelete(id);
    console.log("deleted listing : ",deletedListings);
    req.flash("success", "Listing Deleted!");           // used flash
    res.redirect("/listings");
}