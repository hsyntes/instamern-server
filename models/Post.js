const mongoose = require("mongoose");

const Schema = new mongoose.Schema(
  {
    post_images: {
      type: [String],
      trim: true,
    },

    post_description: {
      type: String,
      trim: true,
    },

    post_postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "A post must have belong to a user."],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
    versionKey: false,
  }
);

const Post = mongoose.model("Post", Schema);

module.exports = Post;
