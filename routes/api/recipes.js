const express = require("express");
const router = express.Router();
const passport = require("passport");

// Recipe model
const Recipe = require("../../models/Recipe");
const Favourite = require("../../models/Favourite");

// Validation
const validateRecipeInput = require("../../validation/recipes");
const validatePagination = require("../../validation/pagination");

// @route   GET api/recipes/test
// @desc    Tests recipe route
// @access  Public
router.get("/test", (req, res) => res.json({msg: "Recipes Works"}));

// @route   GET api/recipes/:name&:meal_type&:cuisine&:calorie_type
// @desc    Get recipes by name, meal_type, cuisine, calorie_type
// @access  Public
router.get("/", (req, res) => {
  const {errors, isValid} = validatePagination(req.query);

  // Check Validation
  if (!isValid) {
    // If any errors, send 400 with errors object
    return res.status(400).json(errors);
  }
  let queryParams = {
    ...req.query,
  };
  if (req.query.name) {
    queryParams.name = {$regex: req.query.name, $options: "i"};
  }
  delete queryParams.page;
  delete queryParams.limit;
  Recipe.find(queryParams)
    .sort({date: -1})
    .skip((Number(req.query.page) - 1) * Number(req.query.limit))
    .limit(Number(req.query.limit))
    .then(recipes => res.json({recipes, count: recipes.length}))
    .catch(err => res.status(404).json({msg: "No recipes found"}));
});

// @route   GET api/recipes/suggested/:name&:meal_type&:cuisine&:calorie_type
// @desc    Get suggested recipes by name, meal_type, cuisine, calorie_type
// @access  Private
router.get(
  "/suggested",
  passport.authenticate("jwt", {session: false}),
  (req, res) => {
    const {errors, isValid} = validatePagination(req.query);

    // Check Validation
    if (!isValid) {
      // If any errors, send 400 with errors object
      return res.status(400).json(errors);
    }
    let queryParams = {
      ...req.query,
    };
    if (req.query.name) {
      queryParams.name = {$regex: req.query.name, $options: "i"};
    }
    if (req.user.bmi <= 18.5) {
      queryParams.calories_per_serving = {$gte: 200};
    } else if (req.user.bmi > 18.5 && req.user.bmi < 24.9) {
      queryParams.calories_per_serving = {$gte: 200, $lte: 400};
    } else if (req.user.bmi > 24.9) {
      queryParams.calories_per_serving = {$lte: 200};
    }
    delete queryParams.page;
    delete queryParams.limit;
    Recipe.find(queryParams)
      .sort({date: -1})
      .skip((Number(req.query.page) - 1) * Number(req.query.limit))
      .limit(Number(req.query.limit))
      .then(recipes => res.json({recipes, count: recipes.length}))
      .catch(err => res.status(404).json({msg: "No recipes found"}));
  }
);

// @route   GET api/recipes/:id
// @desc    Get recipes by id
// @access  Private
router.get(
  "/:id",
  passport.authenticate("jwt", {session: false}),
  (req, res) => {
    Recipe.findById(req.params.id).then(recipe => {
      Favourite.findOne({
        recipe_id: req.params.id,
        user_id: req.user.id,
      })
        .then(favourite => {
          favourite
            ? res.json({...recipe._doc, is_favourite: 1})
            : res.json({...recipe._doc, is_favourite: 0});
        })
        .catch(err =>
          res.status(404).json({msg: "No recipes found with that ID"})
        );
    });
  }
);

// @route   POST api/recipes/create
// @desc    Create recipe
// @access  Private
router.post(
  "/create",
  passport.authenticate("jwt", {session: false}),
  (req, res) => {
    if (!req.user.is_admin) {
      return res
        .status(401)
        .json({msg: "You are not authorized to perform this action."});
    }

    const {errors, isValid} = validateRecipeInput(req.body);

    // Check Validation
    if (!isValid) {
      // If any errors, send 400 with errors object
      return res.status(400).json(errors);
    }

    let calories_per_serving = 0;
    let serving_size = 0;
    let calorie_type = "";

    const {ingredients} = req.body;

    ingredients.map(ingredient => {
      calories_per_serving +=
        (ingredient.calories_p_100 * ingredient.weight) / 100;
      serving_size += ingredient.weight;
    });

    if (calories_per_serving <= 50) {
      calorie_type = "low";
    } else if (calories_per_serving > 50 && calories_per_serving <= 200) {
      calorie_type = "low_med";
    } else if (calories_per_serving > 200 && calories_per_serving <= 300) {
      calorie_type = "medium";
    } else if (calories_per_serving > 300 && calories_per_serving <= 400) {
      calorie_type = "medium_high";
    } else {
      calorie_type = "high";
    }

    const newRecipe = new Recipe({
      ...req.body,
      calories_per_serving,
      calorie_type,
      serving_size,
      user_id: req.user.id,
    });

    newRecipe.save().then(recipe => res.json(recipe));
  }
);

// @route   DELETE api/recipe/:id
// @desc    Delete recipe
// @access  Private
router.delete(
  "/:id",
  passport.authenticate("jwt", {session: false}),
  (req, res) => {
    Recipe.findById(req.params.id)
      .then(recipe => {
        if (recipe.user_id.toString() !== req.user.id) {
          return res.status(401).json({msg: "User not authorized"});
        }

        // Delete
        recipe.remove().then(() => res.json({success: true}));
      })
      .catch(err => res.status(404).json({msg: "No recipe found"}));
  }
);

// @route   POST api/recipes/favourite/:id:action
// @desc    Add/remove recipe to favourite
// @access  Private
router.post(
  "/favourite/:id/:action",
  passport.authenticate("jwt", {session: false}),
  (req, res) => {
    if (req.params.action == 1) {
      const newFavourite = new Favourite({
        user_id: req.user.id,
        recipe_id: req.params.id,
      });

      Favourite.findOne({
        user_id: req.user.id,
        recipe_id: req.params.id,
      }).then(favourite =>
        favourite
          ? res.json({msg: "Already added to favourite"})
          : newFavourite.save().then(favourite => res.json(favourite))
      );
    }

    if (req.params.action == 2) {
      Favourite.findOne({
        user_id: req.user.id,
        recipe_id: req.params.id,
      }).then(favourite =>
        favourite
          ? favourite.remove().then(() => res.json({success: true}))
          : res.json({msg: "Favourite not found"})
      );
    }
  }
);

module.exports = router;
