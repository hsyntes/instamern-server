const express = require("express");
const router = express.Router({ mergeParams: true });
const { verifyToken } = require("../middlewares/auth.middleware");

const {
  createComment,
  deleteComment,
} = require("../controller/comment.controller");

const { checkPostExists } = require("../middlewares/post.middleware");

// * Authenticate Token Middleware
router.use(verifyToken);

// * Check Post Exists Middleware
router.use(checkPostExists);

// * Comment Endpoint(s)
router.route("/").post(createComment);
router.route("/:id").delete(deleteComment);

module.exports = router;
