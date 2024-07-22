const mongoose = require("mongoose");

// * Schema Design
const Schema = new mongoose.Schema(
  {
    post_images: {
      type: [String],
      required: [true, "At least one post image is required."],
      trim: true,
    },

    post_caption: {
      type: String,
      trim: true,
    },

    post_postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "A post must have belong to a user."],
    },

    post_likes: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
    versionKey: false,
  }
);

// * Virtual Populating
Schema.virtual("post_comments", {
  ref: "Comment",
  foreignField: "comment_commentedPost",
  localField: "_id",
});

// * Query Middleware
Schema.pre("findOne", function (next) {
  this.populate("post_comments");

  next();
});

const Post = mongoose.model("Post", Schema);

module.exports = Post;
