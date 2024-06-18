module.exports = class Response {
  // * Send Response
  static send(res, statusCode, status, message, results, data) {
    res.status(statusCode).json({
      status,
      message,
      results,
      data,
    });
  }

  // * Clear JWT
  static clearCookie(res) {
    res.clearCookie("jsonwebtoken");
  }
};
