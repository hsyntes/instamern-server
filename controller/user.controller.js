const User = require("../models/User");
const AWS = require("../aws.config");
const sharp = require("sharp");
const AppError = require("../errors/AppError");
const Response = require("../utils/Response");

// * GET users
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find();

    Response.send(res, 200, "success", undefined, users.length, { users });
  } catch (e) {
    next(e);
  }
};

// * GET user by id
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    Response.send(res, 200, "success", undefined, { user });
  } catch (e) {
    next(e);
  }
};

// * Search user by username
exports.searchUsers = async (req, res, next) => {
  try {
    const { username } = req.body;

    const users = await User.findOne({
      user_username: { $regex: username, $options: "i" },
    });
  } catch (e) {
    next(e);
  }
};

// * Upload user's profile photo
exports.uploadProfilePhoto = async (req, res, next) => {
  try {
    if (!req.file || req.file.fieldname !== "profile_photo")
      return next(
        new AppError(403, "fail", "Please select a profile pictureto upload.")
      );

    // Resize the photo before uploading
    const photo = await sharp(req.file.buffer)
      .resize({
        width: 350,
        height: 350,
        fit: "cover",
      })
      .toFormat("png")
      .png({ quality: 100 })
      .toBuffer();

    const params = {
      Bucket: process.env.AWS_BUCKET,
      Key: `users/${req.user._id}/profile/${req.user.user_username}.png`,
      Body: photo,
    };

    const S3 = new AWS.S3();

    try {
      S3.upload(params, async (err, data) => {
        if (err)
          return next(
            new AppError(422, "fail", `Profile picture couldn't upload: ${err}`)
          );

        const url = data.Location;
        req.user.user_photo = url;

        await req.user.save({ validateBeforeSave: false });

        Response.send(
          res,
          201,
          "success",
          "Profile picture has been uploaded successfully.",
          undefined,
          { user: req.user }
        );
      });
    } catch (e) {
      next(e);
    }
  } catch (e) {
    next(e);
  }
};
