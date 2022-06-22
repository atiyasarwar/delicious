const express = require("express");
const router = express.Router();
const passport = require("passport");

// Recipe model
const Recipe = require("../../models/Recipe");

// Validation
const validateRecipeInput = require("../../validation/recipes");

// @route   GET api/posts/test
// @desc    Tests post route
// @access  Public
router.get("/test", (req, res) => res.json({msg: "Recipes Works"}));

// @route   GET api/recipes
// @desc    Get recipes
// @access  Public
router.get("/", (req, res) => {
  Recipe.find()
    .sort({date: -1})
    .then(posts => res.json(posts))
    .catch(err => res.status(404).json({norecipefound: "No recipes found"}));
});

// @route   GET api/recipes/:id
// @desc    Get recipes by id
// @access  Public
router.get("/:id", (req, res) => {
  Recipe.findById(req.params.id)
    .then(post => res.json(post))
    .catch(err =>
      res.status(404).json({norecipefound: "No recipes found with that ID"})
    );
});

// @route   POST api/posts
// @desc    Create recipe
// @access  Private
router.post("/", passport.authenticate("jwt", {session: false}), (req, res) => {
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

  const newRecipe = new Recipe({
    ...req.body,
    user_id: req.user.id,
  });

  newRecipe.save().then(post => res.json(post));
});

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

// @route   POST api/posts/like/:id
// @desc    Like post
// @access  Private
// router.post(
//   "/like/:id",
//   passport.authenticate("jwt", {session: false}),
//   (req, res) => {
//     Profile.findOne({user: req.user.id}).then(profile => {
//       Recipe.findById(req.params.id)
//         .then(post => {
//           if (
//             post.likes.filter(like => like.user.toString() === req.user.id)
//               .length > 0
//           ) {
//             return res
//               .status(400)
//               .json({alreadyliked: "User already liked this post"});
//           }

//           // Add user id to likes array
//           post.likes.unshift({user: req.user.id});

//           post.save().then(post => res.json(post));
//         })
//         .catch(err => res.status(404).json({postnotfound: "No post found"}));
//     });
//   }
// );

// @route   POST api/posts/unlike/:id
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
