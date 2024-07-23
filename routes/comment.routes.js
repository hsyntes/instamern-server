const express = require("express");
const router = express.Router({ mergeParams: true });

const {
  createComment,
  deleteComment,
} = require("../controllers/comment.controller");

const { checkPostExists } = require("../middlewares/post.middleware");

// * Check Post Exists Middleware
router.use(checkPostExists);

// * Comment Endpoint(s)
router.route("/").post(createComment);
router.route("/:id").delete(deleteComment);

module.exports = router;
