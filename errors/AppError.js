// * Custom error class by extending JavaScript Error Class
module.exports = class AppError extends Error {
  constructor(statusCode, status, message) {
    super(message); // inheritancing the error message property

    this.statusCode = statusCode;
    this.status = status;

    Error.captureStackTrace(this, this.constructor);
  }
};
