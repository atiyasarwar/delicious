const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateRegisterInput(data) {
  let errors = {};

  data.name = !isEmpty(data.name) ? data.name : "";
  data.email = !isEmpty(data.email) ? data.email : "";
  data.password = !isEmpty(data.password) ? data.password : "";
  data.password2 = !isEmpty(data.password2) ? data.password2 : "";
  data.gender = !isEmpty(data.gender) ? data.gender : "";
  data.age = !isEmpty(data.age) ? data.age : "";
  data.height = !isEmpty(data.height) ? data.height : "";
  data.weight = !isEmpty(data.weight) ? data.weight : "";

  if (!Validator.isLength(data.name, {min: 2, max: 30})) {
    errors.name = "Name must be between 2 and 30 characters";
  }

  if (Validator.isEmpty(data.name)) {
    errors.name = "Name field is required";
  }

  if (Validator.isEmpty(data.email)) {
    errors.email = "Email field is required";
  }

  if (!Validator.isEmail(data.email)) {
    errors.email = "Email is invalid";
  }

  if (Validator.isEmpty(data.password)) {
    errors.password = "Password field is required";
  }

  if (!Validator.isLength(data.password, {min: 6, max: 30})) {
    errors.password = "Password must be at least 6 characters";
  }

  if (Validator.isEmpty(data.password2)) {
    errors.password2 = "Confirm your password.";
  }

  if (!Validator.equals(data.password, data.password2)) {
    errors.password2 = "Passwords must match";
  }

  if (Validator.isEmpty(data.gender)) {
    errors.gender = "Enter your gender.";
  }

  if (Validator.isEmpty(String(data.age))) {
    errors.age = "Enter your age.";
  }

  if (Validator.isEmpty(String(data.weight))) {
    errors.weight = "Enter your weight.";
  }

  if (Validator.isEmpty(String(data.height))) {
    errors.height = "Enter your height";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
