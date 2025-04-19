const mongoose = require("mongoose");
const review = require("./review");
const Schema = mongoose.Schema;

const listingSchema = new Schema({                                // Schema -> columns of the Table
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    url: String,
    filename: String,
  },
  price: Number,
  location: String,
  country: String,
  reviews: [                                  // made new field for reviews Which takes reference from Review model
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner: {                                    // made new field for owner for authorization
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  geometry : {                                // to store Geometry cordinates
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ['Point'], // 'location.type' must be 'Point'
      required: true
    },
    coordinates: {
      type: [Number],     // longitude, latitude
      required: true,
    },
  },
});

listingSchema.post("findOneAndDelete", async(listing) => {        // if we delete the listings then reviews should also be deleted.
  if(listing) {
    await review.deleteMany({_id: {$in: listing.reviews}});
  }
});

const Listing = mongoose.model("Listing", listingSchema);           // Model  -> xsort of collection (Table)
module.exports = Listing;                                           // Exporting to app.js