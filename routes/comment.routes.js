const express = require("express");

const { verifyToken } = require("../middlewares/auth.middleware");

const {
  createComment,
  deleteComment,
} = require("../controller/comment.controller");

const { checkPostExists } = require("../middlewares/post.middleware");

const router = express.Router({ mergeParams: true });

// * Authenticate Token Middleware
router.use(verifyToken);

// * Check Post Exists Middleware
router.use(checkPostExists);

// * Comment Endpoint(s)
router.route("/").post(createComment);
router.route("/:id").delete(deleteComment);

module.exports = router;
