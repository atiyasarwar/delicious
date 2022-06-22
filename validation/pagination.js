const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validatePagination(data) {
  let errors = {};

  data.page = !isEmpty(data.page) ? data.page : "";
  data.limit = !isEmpty(data.limit) ? data.limit : "";

  if (Validator.isEmpty(String(data.page))) {
    errors.page = "Page Number is required.";
  }

  if (Validator.isEmpty(String(data.limit))) {
    errors.limit = "Limit is required.";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
