const express = require("express");
const router = express.Router();
const passport = require("passport");

// Ingredient model
const Ingredient = require("../../models/Ingredient");

// Validation
const validateIngredientInput = require("../../validation/ingredient");

// @route   GET api/ingredients/test
// @desc    Tests ingredient route
// @access  Public
router.get("/test", (req, res) => res.json({msg: "Ingredients Works"}));

// @route   GET api/ingredients/:name
// @desc    Get ingredient by name
// @access  Private
router.get("/", passport.authenticate("jwt", {session: false}), (req, res) => {
  Ingredient.find(
    req.query.name && {name: {$regex: req.query.name, $options: "i"}}
  )
    .sort({_id: -1})
    .then(ingredient => res.json({ingredient, count: ingredient.length}))
    .catch(err =>
      res.status(404).json({ingredientnotfound: "No ingredients found"})
    );
});

// @route   POST api/ingredients/create
// @desc    Create ingredient
// @access  Private
router.post(
  "/create",
  passport.authenticate("jwt", {session: false}),
  (req, res) => {
    if (!req.user.is_admin) {
      return res
        .status(401)
        .json({unauthorized: "You are not authorized to perform this action."});
    }

    const {errors, isValid} = validateIngredientInput(req.body);

    // Check Validation
    if (!isValid) {
      // If any errors, send 400 with errors object
      return res.status(400).json(errors);
    }

    const newIngredient = new Ingredient({
      ...req.body,
    });

    newIngredient.save().then(ingredient => res.json(ingredient));
  }
);

// @route   DELETE api/ingredients/:id
// @desc    Delete ingredients
// @access  Private
router.delete(
  "/:id",
  passport.authenticate("jwt", {session: false}),
  (req, res) => {
    Ingredient.findById(req.params.id)
      .then(ingredient => {
        // Delete
        ingredient.remove().then(() => res.json({success: true}));
      })
      .catch(err =>
        res.status(404).json({ingredientnotfound: "No ingredient found"})
      );
  }
);

module.exports = router;
