const express = require("express");
const router = express.Router();

// * API Health
router.get("/", (req, res, next) =>
  res.status(200).json({
    status: "success",
    message: "OK",
  })
);

// * API Endpoints (Nested Routes)
router.use("/auth", require("./auth.routes")); // auth routes
router.use("/users", require("./user.routes")); // user routes
router.use("/posts", require("./post.routes")); // post routes

module.exports = router;
