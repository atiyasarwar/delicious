const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateRecipeInput(data) {
  let errors = {};

  data.name = !isEmpty(data.name) ? data.name : "";
  data.image = !isEmpty(data.image) ? data.image : "";
  data.ingredients = !isEmpty(data.ingredients) ? data.ingredients : "";
  data.ingredients.weight = !isEmpty(data.ingredients.weight)
    ? data.ingredients.weight
    : "";
  data.procedure = !isEmpty(data.procedure) ? data.procedure : "";
  data.meal_type = !isEmpty(data.meal_type) ? data.meal_type : "";
  data.cuisine = !isEmpty(data.cuisine) ? data.cuisine : "";

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

  if (Validator.isEmpty(data.meal_type)) {
    errors.mealType = "Category is required.";
  }

  if (Validator.isEmpty(data.cuisine)) {
    errors.cuisine = "Recipe type is required.";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
