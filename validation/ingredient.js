const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateIngredientInput(data) {
  let errors = {};

  data.name = !isEmpty(data.name) ? data.name : "";
  data.calories_p_100 = !isEmpty(data.calories_p_100)
    ? data.calories_p_100
    : "";

  if (!Validator.isLength(data.name, {min: 2, max: 100})) {
    errors.name = "Ingredient name is required.";
  }

  if (Validator.isEmpty(String(data.calories_p_100))) {
    errors.calories_p_100 = "Calorie/100g are required.";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
