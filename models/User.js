const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");

// * Schema Design
const Schema = new mongoose.Schema(
  {
    user_fullname: {
      type: String,
      required: [true, "Please fill in your name."],
      minlength: [2, "Fullname is too short."],
      maxlength: [24, "Fullname is too long."],
      trim: true,
    },

    user_username: {
      type: String,
      required: [true, "Please specify a unique username."],
      minlength: [3, "Username cannot be shorter than 3 characters."],
      maxlength: [12, "Username cannot be longer than 8 characters."],
      unique: true,
      lowercase: true,
      trim: true,
    },

    user_email: {
      type: String,
      required: [true, "Please write a valid email address."],
      validate: [validator.isEmail, "Invalid email address."],
      lowercase: true,
      unique: true,
      trim: true,
    },

    user_password: {
      type: String,
      required: [true, "Password set up a password."],
      minlength: [8, "Password cannot be shorter than 8 characters."],
      maxlength: [32, "Password cannot be longer than 32 characters."],
      select: false,
      trim: true,
    },

    user_passwordConfirm: {
      type: String,
      required: [true, "Please confirm your password."],
      validate: {
        validator: function (value) {
          return value === this.user_password;
        },

        message: "Passwords do not match.",
      },
      trim: true,
    },

    user_photo: {
      type: String,
      trim: true,
    },

    user_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
    versionKey: false,
  }
);

// * Virtual Populating(s)
Schema.virtual("user_posts", {
  ref: "Post",
  foreignField: "post_postedBy",
  localField: "_id",
});

Schema.virtual("user_stories", {
  ref: "Story",
  foreignField: "story_storiedBy",
  localField: "_id",
});

// * Document Middleware
Schema.pre("save", async function (next) {
  if (!this.isModified("user_password")) return next();

  this.user_password = await bcrypt.hash(this.user_password, 12);
  this.user_passwordConfirm = undefined;

  next();
});

// * Query Middleware(s)
Schema.pre("findOne", function (next) {
  this.populate("user_posts");
  this.find({ user_active: { $ne: false } });

  next();
});

Schema.pre(["find", "findOne"], function (next) {
  this.populate("user_stories");
  this.find({ user_active: { $ne: false } });

  next();
});

// * Aggregation Middleware
Schema.pre("aggregate", function (next) {
  const pipeline = this.pipeline();

  pipeline.unshift(
    {
      $match: { user_active: { $ne: false } },
    },
    {
      $lookup: {
        from: "user_posts",
        foreignField: "post_postedBy",
        localField: "_id",
        as: "user_posts",
      },
    },
    {
      $lookup: {
        from: "user_stories",
        foreignField: "story_storiedBy",
        localField: "_id",
        as: "user_stories",
      },
    }
  );

  next();
});

// * Instance Methods
Schema.methods.comparePasswords = async (candidate, password) =>
  await bcrypt.compare(candidate, password);

const User = mongoose.model("User", Schema);

module.exports = User;
