const AppError = require("../errors/AppError");
const Post = require("../models/Post");

// * Check post does exist or not
exports.checkPostExists = async (req, res, next) => {
  const { post_id } = req.params;

  if (!(await Post.findById(post_id)))
    return next(new AppError(404, "fail", "Post not found to comment."));

  next();
};
