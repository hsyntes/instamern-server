const User = require("../models/User");
const Post = require("../models/Post");
const Story = require("../models/Story");
const Comment = require("../models/Comment");
const AppError = require("../errors/AppError");
const {
  generateToken,
  comparePasswords,
} = require("../middlewares/auth.middleware");
const {
  listObjectsV2,
  deleteObjectsV2,
} = require("../middlewares/s3.middleware");
const Response = require("../utils/Response");

// * Signup
exports.signup = async (req, res, next) => {
  try {
    let { fullname, username, email } = req.body;

    if (fullname.includes(" ")) {
      let firstname = fullname.split(" ").at(0);
      let lastname = fullname.split(" ").at(1);

      firstname = `${firstname.slice(0, 1).toUpperCase()}${firstname
        .slice(1)
        .toLowerCase()}`;

      if (lastname !== "") {
        lastname = `${lastname.slice(0, 1).toUpperCase()}${lastname
          .slice(1)
          .toLowerCase()}`;

        fullname = `${firstname} ${lastname}`;
      } else fullname = firstname;
    }

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
    user.user_active = undefined;

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

    if (!user.user_active) user.user_active = true;

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

// * Logout
exports.logout = async (req, res, next) => {
  try {
    Response.clearCookie();
    Response.send(res, 200, "success", "You're just logged out.");
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

    // Check current password is correct or not
    if (!(await comparePasswords(req.user, req.body.currentPassword)))
      return next(
        new AppError(
          401,
          "fail",
          "Your current Password does not match your account password."
        )
      );

    // Check current password is not the same as previous password or not
    if (await comparePasswords(req.user, req.body.password))
      return next(
        new AppError(
          409,
          "fail",
          "Your new password cannot be the same as your previous password."
        )
      );

    // Update passwords
    req.user.user_password = req.body.password;
    req.user.user_passwordConfirm = req.body.passwordConfirm;

    // Validate the document
    await req.user.save();

    // Clear cookie
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

// * Update Email
exports.updateEmail = async (req, res, next) => {
  try {
  } catch (e) {
    next(e);
  }
};

// * Deactivate Account
exports.deactivateAccount = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { user_active: false });
    Response.send(res, 200, "success", "You're account has been deactivated.");
  } catch (e) {
    next(e);
  }
};

// * Delete Account
exports.deleteAccount = async (req, res, next) => {
  try {
    // Delete user and their related documents
    await User.findByIdAndDelete(req.user._id);
    await Post.deleteMany({ post_postedBy: req.user._id });
    await Story.deleteMany({ story_storiedBy: req.user._id });
    await Comment.deleteMany({ comment_commentedBy: req.user._id });

    // Delete user's profile photo & post images from AWS S3
    const objectsV2 = await listObjectsV2({ Prefix: `users/${req.user._id}` });
    await deleteObjectsV2(objectsV2);

    // Delete user's story photos from AWS S3

    Response.send(res, 204);
  } catch (e) {
    next(e);
  }
};
