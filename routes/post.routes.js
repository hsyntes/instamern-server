const express = require("express");
const multer = require("multer");
const { verifyToken } = require("../middlewares/auth.middleware");

const {
  createPost,
  getPost,
  deletePost,
} = require("../controller/post.controller");

const router = express.Router();
const storage = multer({ storage: multer.memoryStorage() });

// * Authenticate Token Middleware
router.use(verifyToken);

router.route("/").post(storage.array("post_images", 10), createPost);
router.route("/:id").get(getPost).delete(deletePost);

// * Nested Routes
router.use("/:post_id/comments", require("./comment.routes"));

module.exports = router;
