const express = require("express");
const router = express.Router();     // Creates new Router object
const User = require("../models/user.js");      // requring User model to create new user here.
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const {saveRedirectUrl} = require("../middleware.js");

const userController = require("../controllers/users.js");

// Router.route
// combining -> signup get, post   "/signup"
router.route("/signup")
.get(userController.renderSignupForm)
.post(wrapAsync(userController.signup));

// combining -> login get, post     "/login"
router.route("/login")
.get(userController.renderLoginForm)
.post(saveRedirectUrl, passport.authenticate("local", { failureRedirect: '/login', failureFlash: true }) ,userController.login);

// logout
router.get("/logout", userController.logout);


module.exports = router;



/*
// signup
router.get("/signup", userController.renderSignupForm);

router.post("/signup", wrapAsync(userController.signup));

// login
router.get("/login", userController.renderLoginForm);

router.post("/login", saveRedirectUrl, passport.authenticate("local", { failureRedirect: '/login', failureFlash: true }) ,userController.login);


*/

