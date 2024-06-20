const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");

// * Schema Design
const Schema = new mongoose.Schema(
  {
    user_fullname: {
      type: String,
      required: [true, "Please fill in your name."],
      trim: true,
    },

    user_username: {
      type: String,
      required: [true, "Please specify a unique username."],
      unique: true,
      lowercase: true,
      trim: true,
    },

    user_email: {
      type: String,
      required: [true, "Please write a valid email address."],
      validate: [validator.isEmail, "Invalid email address."],
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

        message: "Password doesn't match",
      },
      trim: true,
    },

    user_photo: {
      type: String,
      trim: true,
    },

    active: {
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
  if (!this.isModified("user_password")) next();

  this.user_password = await bcrypt.hash(this.user_password, 12);
  this.user_passwordConfirm = undefined;

  next();
});

// * Query Middleware(s)
Schema.pre("findOne", function (next) {
  this.populate("user_posts");

  next();
});

Schema.pre("find", function (next) {
  this.populate("user_stories");

  next();
});

// * Instance Methods
Schema.methods.comparePasswords = async (candidate, password) =>
  await bcrypt.compare(candidate, password);

const User = mongoose.model("User", Schema);

module.exports = User;
