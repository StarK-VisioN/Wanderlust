const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}

const initDB = async () => {
  await Listing.deleteMany({});                           // deleting all privious data from the DB
  initData.data = initData.data.map((obj) => ({...obj, owner: "67faa02437a9aae78eeda0c0",}));
  await Listing.insertMany(initData.data);                // inserting all new data from data.js
  console.log("data was initialized");
};

initDB();