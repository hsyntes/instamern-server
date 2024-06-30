const User = require("../models/User");
const jsonwebtoken = require("jsonwebtoken");
const AppError = require("../errors/AppError");

// * Generate JSON Web Token
exports.generateToken = (id) => {
  const token = jsonwebtoken.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  return token;
};

// * Save the token
exports.saveToken = (res, token) =>
  res.cookie("jsonwebtoken", token, {
    expires: new Date(
      Date.now() + parseInt(process.env.JWT_EXPIRES_IN) * 24 * 60 * 60 * 1000
    ),
    httpOnly: false,
    path: "/",
    // secure: true,
  });

// * Verifying JWT Token
exports.verifyToken = async (req, res, next) => {
  try {
    let token;

    // * GET Token
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    )
      token = req.headers.authorization.split("Bearer").at(1).trim();
    else
      return next(
        new AppError(401, "fail", "You're not logged in. Please log in.")
      );

    // * Decode Token
    const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);

    // * Find a user based on the token
    const user = await User.findById(decoded.id).select("+user_password");

    if (!user)
      return next(
        new AppError(
          404,
          "fail",
          "Logged in user not found. Please try to log in."
        )
      );

    // * Grant Access
    req.user = user;

    next();
  } catch (e) {
    next(e);
  }
};

// * Comparing Passwords
exports.comparePasswords = async (user, password) =>
  await user.comparePasswords(password, user.user_password);
