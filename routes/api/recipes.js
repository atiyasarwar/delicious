const express = require("express");
const router = express.Router();
const passport = require("passport");

// Recipe model
const Recipe = require("../../models/Recipe");

// Validation
const validateRecipeInput = require("../../validation/recipes");
const validatePagination = require("../../validation/pagination");

// @route   GET api/recipes/test
// @desc    Tests post route
// @access  Public
router.get("/test", (req, res) => res.json({msg: "Recipes Works"}));

// @route   GET api/recipes/:mealType&:cuisine&:calorie_type
// @desc    Get recipes by mealType, cuisine, calorie_type
// @access  Private
router.get("/", passport.authenticate("jwt", {session: false}), (req, res) => {
  const {errors, isValid} = validatePagination(req.query);

  // Check Validation
  if (!isValid) {
    // If any errors, send 400 with errors object
    return res.status(400).json(errors);
  }
  const queryParams = {
    ...req.query,
  };
  delete queryParams.page;
  delete queryParams.limit;
  Recipe.find(queryParams)
    .sort({date: -1})
    .skip((Number(req.query.page) - 1) * Number(req.query.limit))
    .limit(Number(req.query.limit))
    .then(recipe => res.json({recipe, count: recipe.length}))
    .catch(err => res.status(404).json({norecipefound: "No recipes found"}));
});

// @route   GET api/recipes/:id
// @desc    Get recipes by id
// @access  Public
router.get("/:id", (req, res) => {
  Recipe.findById(req.params.id)
    .then(recipe => res.json(recipe))
    .catch(err =>
      res.status(404).json({norecipefound: "No recipes found with that ID"})
    );
});

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
        .json({unauthorized: "You are not authorized to perform this action."});
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
      console.log(ingredient);
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
          return res.status(401).json({unauthorized: "User not authorized"});
        }

        // Delete
        recipe.remove().then(() => res.json({success: true}));
      })
      .catch(err => res.status(404).json({recipenotfound: "No recipe found"}));
  }
);

// @route   POST api/recipes/favorite/:id
// @desc    Like post
// @access  Private
router.post(
  "/favorite/:id",
  passport.authenticate("jwt", {session: false}),
  (req, res) => {
    Profile.findOne({user: req.user.id}).then(profile => {
      Recipe.findById(req.params.id)
        .then(post => {
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length > 0
          ) {
            return res
              .status(400)
              .json({alreadyliked: "User already liked this post"});
          }

          // Add user id to likes array
          post.likes.unshift({user: req.user.id});

          post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({postnotfound: "No post found"}));
    });
  }
);

// @route   POST api/recipes/unlike/:id
// @desc    Unlike post
// @access  Private
// router.post(
//   "/unlike/:id",
//   passport.authenticate("jwt", {session: false}),
//   (req, res) => {
//     Profile.findOne({user: req.user.id}).then(profile => {
//       Recipe.findById(req.params.id)
//         .then(post => {
//           if (
//             post.likes.filter(like => like.user.toString() === req.user.id)
//               .length === 0
//           ) {
//             return res
//               .status(400)
//               .json({notliked: "You have not yet liked this post"});
//           }

//           // Get remove index
//           const removeIndex = post.likes
//             .map(item => item.user.toString())
//             .indexOf(req.user.id);

//           // Splice out of array
//           post.likes.splice(removeIndex, 1);

//           // Save
//           post.save().then(post => res.json(post));
//         })
//         .catch(err => res.status(404).json({postnotfound: "No post found"}));
//     });
//   }
// );

module.exports = router;
