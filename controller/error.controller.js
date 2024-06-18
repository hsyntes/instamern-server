const AppError = require("../errors/AppError");
const Response = require("../utils/Response");

// ! 403: Validation Error
const validationError = (err) => {
  const messages = err.message.split(",");

  const message = messages
    .map((message, index) => message.split(":").at(index === 0 ? 2 : 1))
    .join("")
    .trim();

  return new AppError(403, "fail", message);
};

// ! 409: Duplicate Key Error
const duplicateKeyError = (err) => {
  if (err.keyPattern.hasOwnProperty("user_username"))
    return new AppError(409, "fail", "This username has already taken.");

  return new AppError(409, "fail", err.message);
};

module.exports = (err, req, res, next) => {
  console.error(err);

  // * Parsing Errors
  if (err.name === "ValidationError") err = validationError(err);
  if (err.code === 11000) err = duplicateKeyError(err);

  // * GET statusCode and status from error object
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // * Send Error
  Response.send(
    res,
    err.statusCode,
    err.status,
    err.message,
    undefined,
    undefined
  );

  next();
};
