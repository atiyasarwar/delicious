const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const IngredientSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  calories_p_100: {
    type: Number,
    required: true,
  },
});

module.exports = Ingredient = mongoose.model("ingredient", IngredientSchema);
