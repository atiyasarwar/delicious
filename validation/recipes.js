const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateRecipeInput(data) {
  let errors = {};

  data.name = !isEmpty(data.name) ? data.name : "";
  data.image = !isEmpty(data.image) ? data.image : "";
  data.ingredients = !isEmpty(data.ingredients) ? data.ingredients : "";
  data.procedure = !isEmpty(data.procedure) ? data.procedure : "";
  data.category = !isEmpty(data.category) ? data.category : "";
  data.foodType = !isEmpty(data.foodType) ? data.foodType : "";
  data.type = !isEmpty(data.type) ? data.type : "";
  data.calories = !isEmpty(data.calories) ? data.calories : "";

  if (!Validator.isLength(data.name, {min: 10, max: 300})) {
    errors.name = "Recipe name is required.";
  }

  if (Validator.isEmpty(data.name)) {
    errors.name = "Recipe name is required.";
  }

  if (Validator.isEmpty(data.image)) {
    errors.image = "Image is required.";
  }

  if (Validator.isEmpty(String(data.ingredients))) {
    errors.ingredients = "Ingredients are required.";
  }

  if (Validator.isEmpty(String(data.procedure))) {
    errors.procedure = "Procedure are required.";
  }

  if (Validator.isEmpty(data.category)) {
    errors.category = "Category is required.";
  }

  if (Validator.isEmpty(data.foodType)) {
    errors.foodType = "Recipe type is required.";
  }

  if (Validator.isEmpty(data.type)) {
    errors.type = "Calorie type is required.";
  }

  if (Validator.isEmpty(String(data.calories))) {
    errors.calories = "Calorie count is required.";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
