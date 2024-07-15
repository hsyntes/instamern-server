const express = require("express");
const multer = require("multer");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth.middleware");

const {
  getStoriesByUserId,
  getStoryByUserId,
  createStory,
  deleteStory,
} = require("../controllers/story.controller");

const storage = multer({ storage: multer.memoryStorage() });

// * Story Endpoint(s)
router.get("/", getStoriesByUserId);
router.get("/:userId", getStoryByUserId);

// * Authenticate Token Middleware
router.use(verifyToken);

// * Story Endpoint(s)
router.post("/", storage.single("story_photo"), createStory);
router.delete("/", deleteStory);

module.exports = router;
