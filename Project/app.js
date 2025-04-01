const express = require("express");
const app = express();
const mongoose = require('mongoose');
const port = 5500;
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));


const Listing = require("./models/listing.js");                                    // Schema and Models...Where models are used for Collection.
const initData = require("./init/data.js");                                      // initializing with new data 

main().then(() => {
    console.log("Connected to DB");     
})
.catch((err) => {
    console.log(err);
});

async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}



app.get("/", (req, res) => {
    res.send("Hi, I am root");
});

// Index route 
app.get("/listings", async (req, res) => {
    const allListings = await Listing.find({});                 // Fetch all documents from the Listing model and store them in the allListings variable
    res.render("./listings/index.ejs", { allListings });
});

// New route 
app.get("/listings/new", (req, res) => {
    // let {id} = req. params;
    res.render("./listings/new.ejs")
});

// Show route
app.get("/listings/:id", async(req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);             // on the basis of ID will get the complete Listing data -> which we will store in 'listing'
    res.render("./listings/show.ejs", {listing});                      // and will pass this variable 'listing' in show.ejs
})

// Create route 
app.post("/listings", async(req, res) => {                  // as we are going to make changes in DB so need to wait until data is not inserted     So used async
    // let {title, description, image, price, location, country} = req.body;
    const newListing = new Listing(req.body.listing);                         // as we make objects of those listings
    await newListing.save();
    res.redirect("/listings");
})

// Edit route 
app.get("/listings/:id/edit", async(req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("./listings/edit.ejs", {listing});
});


// Update route
app.put("/listings/:id", async(req, res) => {
    let {id} = req.params;
    const listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});     // {...req.body.listings}  -> we are going to deconstruct the values of object to get individual key-values & add them individually in DB
    res.redirect(`/listings/${id}`);          // to our show route   "/listings/:id"
});

// Delete route
app.delete("/listings/:id", async(req, res) => {                    // making changes in DB so need to use async function
    let {id} = req.params;
    const deletedListings = await Listing.findByIdAndDelete(id);
    console.log("deleted listing : ",deletedListings);
    res.redirect("/listings");
});








// app.get("/testListings",async (req, res) => {
//     let sampleListing = new Listing ({
//         title: "My home",
//         description: "By the beach",
//         price: 1200,
//         location: "calenguth, Goa",
//         country: "India"
//     });

//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("successfully testing");
// })

app.listen(port, () => {
    console.log(`listening on port ${port}`);
});

