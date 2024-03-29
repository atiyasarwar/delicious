const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const passport = require("passport");

// Load Input Validation
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");
const validatePagination = require("../../validation/pagination");

// Load User model
const User = require("../../models/User");
const Recipe = require("../../models/Recipe");
const Favourite = require("../../models/Favourite");

// @route   GET api/users/test
// @desc    Tests users route
// @access  Public
router.get("/test", (req, res) => res.json({msg: "Users Works"}));

// @route   GET api/users/register
// @desc    Register user
// @access  Public
router.post("/register", (req, res) => {
  const {errors, isValid} = validateRegisterInput(req.body);

  // Check Validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  User.findOne({email: req.body.email}).then(user => {
    if (user) {
      errors.email = "Email already exists";
      return res.status(400).json(errors);
    } else {
      const avatar = gravatar.url(req.body.email, {
        s: "200", // Size
        r: "pg", // Rating
        d: "mm", // Default
      });
      const bmi = req.body.weight / req.body.height ** 2;
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        age: req.body.age,
        gender: req.body.gender,
        weight: req.body.weight,
        height: req.body.height,
        avatar,
        bmi,
        password: req.body.password,
      });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(user => res.json(user))
            .catch(err => console.log(err));
        });
      });
    }
  });
});

// @route   GET api/users/login
// @desc    Login User / Returning JWT Token
// @access  Public
router.post("/login", (req, res) => {
  const {errors, isValid} = validateLoginInput(req.body);

  // Check Validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const email = req.body.email;
  const password = req.body.password;

  // Find user by email
  User.findOne({email}).then(user => {
    // Check for user
    if (!user) {
      errors.email = "User not found";
      return res.status(404).json(errors);
    }

    // Check Password
    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        // User Matched
        const payload = {id: user.id, name: user.name, avatar: user.avatar}; // Create JWT Payload
        delete user.password;
        // Sign Token
        jwt.sign(
          payload,
          keys.secretOrKey,
          {expiresIn: 360000},
          (err, token) => {
            res.json({
              success: true,
              user,
              token: "Bearer " + token,
            });
          }
        );
      } else {
        errors.password = "Password incorrect";
        return res.status(400).json(errors);
      }
    });
  });
});

// @route   GET api/users/current
// @desc    Return current user
// @access  Private
router.get(
  "/current",
  passport.authenticate("jwt", {session: false}),
  (req, res) => {
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      weight: req.user.weight,
      height: req.user.height,
      bmi: req.user.bmi,
    });
  }
);

// @route   PUT api/users
// @desc    Update current users
// @access  Private
router.put("/", passport.authenticate("jwt", {session: false}), (req, res) => {
  User.findById(req.user.id).then(user => {
    const updatedData = {...user._doc, ...req.body};
    const bmi = updatedData.weight / updatedData.height ** 2;
    updatedData.bmi = bmi;
    delete updatedData.email;
    delete updatedData.password;
    User.findOneAndUpdate({_id: updatedData._id}, updatedData, {
      new: true,
    })
      .then(user => res.json(user))
      .catch(err => console.log(err));
  });
});

// @route   DELETE api/users
// @desc    Delete user
// @access  Private
router.delete(
  "/",
  passport.authenticate("jwt", {session: false}),
  (req, res) => {
    User.findById(req.user.id)
      .then(user => {
        user.remove().then(() => res.json({success: true}));
      })
      .catch(err => res.status(404).json({msg: "No user found"}));
  }
);

// @route   GET api/users/favourites
// @desc    Get favourites
// @access  Private
router.get(
  "/favourites",
  passport.authenticate("jwt", {session: false}),
  (req, res) => {
    const {errors, isValid} = validatePagination(req.query);

    // Check Validation
    if (!isValid) {
      // If any errors, send 400 with errors object
      return res.status(400).json(errors);
    }

    Favourite.find({user_id: req.user.id})
      .sort({date: -1})
      .skip((Number(req.query.page) - 1) * Number(req.query.limit))
      .limit(Number(req.query.limit))
      .then(async favourites => {
        const recipeList = favourites.map(item =>
          Recipe.findById(item.recipe_id).then(recipe => recipe)
        );
        const recipes = await Promise.all(recipeList);
        res.json({recipes, count: recipes.length});
      });
  }
);

module.exports = router;
