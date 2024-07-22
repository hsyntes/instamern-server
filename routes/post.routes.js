const express = require("express");
const router = express.Router();
const multer = require("multer");
const { verifyToken } = require("../middlewares/auth.middleware");

const {
  getPosts,
  createPost,
  getPost,
  updatePost,
  deletePost,
  likePost,
} = require("../controllers/post.controller");

const storage = multer({ storage: multer.memoryStorage() });

// * Post Endpoint(s)
router.get("/", getPosts);
router.get("/:id", getPost);

// * Authenticate Token Middleware
router.use(verifyToken);

// * Post Endpoint(s)
router.route("/").post(storage.array("post_images", 10), createPost);

router.route("/:id").patch(updatePost).delete(deletePost);
router.route("/:id/like").patch(likePost);

// * Nested Routes
router.use("/:post_id/comments", require("./comment.routes"));

module.exports = router;
