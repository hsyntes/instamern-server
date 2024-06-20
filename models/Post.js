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
