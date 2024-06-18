const AppError = require("../errors/AppError");
const {
  generateToken,
  comparePasswords,
} = require("../middlewares/auth.middleware");
const User = require("../models/User");
const Response = require("../utils/Response");

// * Signup
exports.signup = async (req, res, next) => {
  try {
    const { fullname, username, email } = req.body;

    const user = await User.create({
      user_fullname: fullname,
      user_username: username,
      user_email: email,
      user_password: req.body.password,
      user_passwordConfirm: req.body.passwordConfirm,
    });

    const token = generateToken(user._id);

    res.cookie("jsonwebtoken", token, {
      expires: new Date(
        Date.now() + parseInt(process.env.JWT_EXPIRES_IN) * 24 * 60 * 60
      ),
      secure: true,
    });

    user.user_password = undefined;
    user.active = undefined;

    Response.send(res, 201, "success", "Signed up successfully!", undefined, {
      token,
      user,
    });
  } catch (e) {
    next(e);
  }
};

// * Login
exports.login = async (req, res, next) => {
  try {
    if (!req.body.username || !req.body.password)
      return next(
        new AppError(403, "fail", "Please enter your username and password.")
      );

    const { username } = req.body;

    const user = await User.findOne({ user_username: username }).select(
      "+user_password +active"
    );

    if (!user)
      return next(
        new AppError(
          404,
          "fail",
          "User not found. You can sign up with that username."
        )
      );

    if (!(await comparePasswords(user, req.body.password)))
      return next(new AppError(401, "fail", "Password does not match."));

    if (!user.active) user.active = true;

    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);

    Response.send(res, 200, "success", "Welcome back!", undefined, {
      token,
      user,
    });
  } catch (e) {
    next(e);
  }
};

// * Change Password
exports.updatePassword = async (req, res, next) => {
  try {
    // Check current password is empty or not
    if (
      !req.body.currentPassword ||
      !req.body.password ||
      !req.body.passwordConfirm
    )
      return next(
        new AppError(
          403,
          "fail",
          "Please enter your current and new password completely."
        )
      );

    if (!(await comparePasswords(req.user, req.body.currentPassword)))
      return next(
        new AppError(
          401,
          "fail",
          "Your current Password does not match your account password."
        )
      );

    if (await comparePasswords(req.user, req.body.password))
      return next(
        new AppError(
          409,
          "fail",
          "Your new password cannot be the same as your previous password."
        )
      );

    req.user.user_password = req.body.password;
    req.user.user_passwordConfirm = req.body.passwordConfirm;

    await req.user.save();

    Response.clearCookie(res);

    Response.send(
      res,
      200,
      "success",
      "Your password has been updated successfully."
    );
  } catch (e) {
    next(e);
  }
};

// * Deactivate Account
exports.deactivateAccount = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { active: false });
    Response.send(res, 200, "success", "You're account has been deactivated.");
  } catch (e) {
    next(e);
  }
};

// * Delelete Account
exports.deleteAccount = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    Response.send(res, 204);
  } catch (e) {
    next(e);
  }
};
