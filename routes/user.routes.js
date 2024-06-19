const express = require("express");
const multer = require("multer");
const { verifyToken } = require("../middlewares/auth.middleware");

const {
  getUsers,
  getUser,
  uploadProfilePhoto,
} = require("../controller/user.controller");

const router = express.Router();
const storage = multer({ storage: multer.memoryStorage() });

// * User Endpoints
router.route("/").get(getUsers);
router.route("/:id").get(getUser);

// * Authenticate Token Middleware
router.use(verifyToken);

router.post("/upload", storage.single("profile_photo"), uploadProfilePhoto);

module.exports = router;
