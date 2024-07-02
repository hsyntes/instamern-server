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

// * GET user by username
exports.getUserByUsername = async (req, res, next) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ user_username: username });

    Response.send(res, 200, "success", undefined, undefined, { user });
  } catch (e) {
    next(e);
  }
};

// * Check user exists by username
exports.checkUserExistsByUsername = async (req, res, next) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ user_username: username });

    if (user) return next(new AppError(409, "fail", "Username in use."));

    Response.send(res, 200, "success");
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

    Response.send(res, 200, "success");
  } catch (e) {
    next(e);
  }
};

// * GET random users
exports.getRandomUsers = async (req, res, next) => {
  try {
    const { size } = req.params;

    const users = await User.aggregate([
      {
        $sample: { size: Number(size) || 5 },
      },
      {
        $project: {
          user_posts: 0,
          user_active: 0,
        },
      },
    ]);

    Response.send(res, 200, "success", undefined, users.length, { users });
  } catch (e) {
    next(e);
  }
};

// * Search user by username
exports.searchUsers = async (req, res, next) => {
  try {
    const { q } = req.params;

    const users = await User.find({
      $or: [
        { user_username: { $regex: q, $options: "i" } },
        { user_fullname: { $regex: q, $options: "i" } },
      ],
    });

    Response.send(res, 200, "success", undefined, users.length, { users });
  } catch (e) {
    next(e);
  }
};

// * Upload user's profile photo
exports.uploadProfilePhoto = async (req, res, next) => {
  try {
    if (!req.file || req.file.fieldname !== "profile_photo")
      return next(
        new AppError(403, "fail", "Please select a profile picture to upload.")
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

    S3.upload(params, async function (err, data) {
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
        "Profile picture has been uploaded successfully."
      );
    });
  } catch (e) {
    next(e);
  }
};
