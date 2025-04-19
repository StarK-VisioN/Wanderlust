if(process.env.NODE_ENV != "production" ) {
    require('dotenv').config()
}

const express = require("express");
const app = express();
const mongoose = require('mongoose');
const port = 5500;
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const wrapAsync = require("./utils/wrapAsync.js");                      // requiring error class in server
const ExpressError = require("./utils/ExpressError.js")
const {listingSchema, reviewSchema} = require("./Schema.js");       // -> because as we break down app.js server into routes of listing & reviews
                                                                    //    so there is no use of this. As we require them in those files.

// the exported files are required here.
const listingRouter = require("./routes/listing.js");                
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const db_url = process.env.ATLAS_URL;

main().then(() => {
    console.log("Connected to DB");     
})
.catch((err) => {
    console.log(err);
});

async function main() {
    // await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
    await mongoose.connect(db_url);
}

// Connect-Mongo
const store = MongoStore.create({
    mongoUrl: db_url,
    crypto: {
        secret: process.enev.SECRET,
    },
    touchAfter: 24 * 3600,          // storing session for 24 hrs -> i.e 3600
});

store.on("error", () => {
    console.log("ERROR in MONGO SESSION STORE", err);
})

// Express - Session
const sessionOptions = {
    store,                                  // this variable is used here, from Connect-Mongo
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,                           // 7 days, 24 hrs, 60 min, 60 sec, 1000 milisec
        maxAge: 7 * 24 * 60 * 60 * 1000
    },
};




// app.get("/", (req, res) => {
//     res.send("Hi, I am root");
// });

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());             // middleware that initialize passport
app.use(passport.session());                // a web application needs the ability to identify users as they browse from page to page.This series of requests ans responses, each associated with the same user, is known as session.
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;             // information of the currect session user is stored in currUser
    next();
})

// Demo User
// app.get("/register", async(req, res) => {
//     let fakeUser = new User ({
//         email: "student@gmail.com",
//         username: "delta-student",           // passport-local-mongoose allows us to set username, not matters if we dont add schema for username
//     });

//     let registeredUser = await User.register(fakeUser, "hellowrold");  // register(user, password, cb) Convenience method to register a new user instance with a given password. Checks if username is unique
//     res.send(registeredUser);
// });

app.use("/listings", listingRouter);                             // for listings route    i.e.   /listings
app.use("/listings/:id/reviews", reviewRouter);                  // for reviews route     i.e.   /listings/:id/reviews
app.use("/", userRouter);                                        // for user route

const Listing = require("./models/listing.js");                                    // Schema and Models...Where models are used for Collection.
const initData = require("./init/data.js");                                      // initializing with new data 
const Review = require("./models/review.js");                                      // Schema and Models ..Where models are used for Collection


// Error handling middleware
// app.use((err, req, res, next) => {
//     res.send("Some things went wrong!");                 // common error for all pages
// });


// Custom errors 
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page not found!"));             // this error will work for all routes 
});                                                             // e.g. we send the req on localhost:5500/listing -> which doesnt exists then will get the error "Page not found!"

app.use((err, req, res, next) => {
    let{statusCode=500, message= "Something went wrong!" } = err;
    res.status(statusCode).render("error.ejs", {message});
    // res.status(statusCode).send(message);
});


app.listen(port, () => {
    console.log(`listening on port ${port}`);
});

