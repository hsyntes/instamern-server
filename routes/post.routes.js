const express = require("express");
const multer = require("multer");
const { verifyToken } = require("../middlewares/auth.middleware");

const { createPost, deletePost } = require("../controller/post.controller");

const router = express.Router();
const storage = multer({ storage: multer.memoryStorage() });

// * Authenticate Token Middleware
router.use(verifyToken);

router.route("/").post(storage.array("post_images", 10), createPost);
router.route("/:id").delete(deletePost);

module.exports = router;
