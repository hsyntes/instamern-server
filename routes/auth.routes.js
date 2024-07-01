const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middlewares/auth.middleware");

const {
  signup,
  login,
  getCurrentUser,
  logout,
  updatePassword,
  deactivateAccount,
  deleteAccount,
} = require("../controller/auth.controller");

// * Auth Enpoints
router.post("/signup", signup);
router.post("/login", login);

// * Authenticate Token Middleware
router.use(verifyToken);

// * Auth Endpoint(s)
router.get("/current-user", getCurrentUser);
router.post("/logout", logout);
router.patch("/update-password", updatePassword);
router.patch("/deactivate", deactivateAccount);
router.delete("/delete", deleteAccount);

module.exports = router;
