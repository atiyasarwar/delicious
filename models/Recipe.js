const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const RecipeSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "users",
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  ingredients: {
    type: Array,
    required: true,
  },
  procedure: {
    type: Array,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  foodType: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  calories: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = Recipe = mongoose.model("recipe", RecipeSchema);
