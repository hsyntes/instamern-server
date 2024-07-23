const Comment = require("../models/Comment");
const Response = require("../utils/Response");

// * CREATE Comment
exports.createComment = async (req, res, next) => {
  try {
    const comment = await Comment.create({
      comment: req.body.comment,
      comment_commentedPost: req.params.post_id,
      comment_commentedBy: req.user._id,
    });

    Response.send(res, 201, "success", undefined, undefined, { comment });
  } catch (e) {
    console.error("error: ", e);
    next(e);
  }
};

// * DELETE comment by id
exports.deleteComment = async (req, res, next) => {
  try {
    await Comment.findByIdAndDelete(req.params.id);

    Response.send(res, 204);
  } catch (e) {
    next(e);
  }
};
