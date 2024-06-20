const mongoose = require("mongoose");

const Schema = new mongoose.Schema(
  {
    comment: {
      type: String,
      required: [true, "Comment is required."],
    },

    comment_commentedPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: [true, "A comment must belong to a post."],
    },

    comment_commentedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "A comment must belong to a user."],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
    versionKey: false,
  }
);

const Comment = mongoose.model("Comment", Schema);

module.exports = Comment;
