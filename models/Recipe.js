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
  meal_type: {
    type: String,
    required: true,
  },
  cuisine: {
    type: String,
    required: true,
  },
  calorie_type: {
    type: String,
    required: true,
  },
  category: {
    type: String,
  },
  calories_per_serving: {
    type: Number,
    required: true,
  },
  serving_size: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = Recipe = mongoose.model("recipe", RecipeSchema);
