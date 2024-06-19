const express = require("express");
const multer = require("multer");
const { verifyToken } = require("../middlewares/auth.middleware");

const { createPost } = require("../controller/post.controller");

const router = express.Router();
const storage = multer({ storage: multer.memoryStorage() });

router.use(verifyToken);
router.route("/").post(storage.array("post_images", 10), createPost);

module.exports = router;
