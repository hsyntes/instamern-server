const express = require("express");
const multer = require("multer");

const { verifyToken } = require("../middlewares/auth.middleware");

const {
  getUsers,
  getUser,
  getRandomUsers,
  searchUsers,
  getUserByUsername,
  checkUserExistsByUsername,
  checkUserExistsByEmail,
  uploadProfilePhoto,
} = require("../controller/user.controller");

const router = express.Router();
const storage = multer({ storage: multer.memoryStorage() });

// * User Endpoint(s)
router.route("/").get(getUsers);
router.route("/:id").get(getUser);
router.get("/random/:size", getRandomUsers);
router.get("/search/:q", searchUsers);
router.get("/username/:username", getUserByUsername);
router.get("/check/username/:username", checkUserExistsByUsername);
router.get("/check/email/:email", checkUserExistsByEmail);

// * Authenticate Token Middleware
router.use(verifyToken);

// * User Endpoint(s)
router.post("/upload", storage.single("profile_photo"), uploadProfilePhoto);

module.exports = router;
