const express = require("express");
const multer = require("multer");
const { verifyToken } = require("../middlewares/auth.middleware");
const { createStory, deleteStory } = require("../controller/story.controller");

const router = express.Router();
const storage = multer({ storage: multer.memoryStorage() });

// * Authenticate Token Middleware
router.use(verifyToken);

router.post("/", storage.single("story_photo"), createStory);
router.delete("/", deleteStory);

module.exports = router;
