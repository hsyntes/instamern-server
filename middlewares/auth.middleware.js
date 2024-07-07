const User = require("../models/User");
const AppError = require("../errors/AppError");
const jsonwebtoken = require("jsonwebtoken");
const { getCurrentUserByToken } = require("../utils/helpers");

// * Verifying JWT Token
exports.verifyToken = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    )
      token = req.headers.authorization.split("Bearer").at(1).trim();
    else
      return next(
        new AppError(401, "fail", "You're not logged in. Please log in.")
      );

    // Decode token
    const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("+user_password");

    if (!user)
      return next(
        new AppError(
          404,
          "fail",
          "No logged in user found. Please try to log in."
        )
      );

    // * Grant Access
    req.user = user;

    next();
  } catch (e) {
    next(e);
  }
};
