const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const FavouriteSchema = new Schema({
  user_id: {
    type: String,
    required: true,
  },
  recipe_id: {
    type: String,
    required: true,
  },
});

module.exports = Favourite = mongoose.model("favourite", FavouriteSchema);
