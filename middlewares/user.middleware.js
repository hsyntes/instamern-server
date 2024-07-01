const AppError = require("../errors/AppError");
const User = require("../models/User");
const Response = require("../utils/Response");

// * Check user exists by username
exports.checkUserExistsByUsername = async (req, res, next) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ user_username: username });

    if (user) return next(new AppError(409, "fail", "Username in use."));

    next();
  } catch (e) {
    next(e);
  }
};

// * Check user exists by email
exports.checkUserExistsByEmail = async (req, res, next) => {
  try {
    const { email } = req.params;

    const user = await User.findOne({ user_email: email });

    if (user) return next(new AppError(409, "fail", "Email in use."));

    next();
  } catch (e) {
    next(e);
  }
};
