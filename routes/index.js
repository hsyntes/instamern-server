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
router.use("/users", require("./user.routes")); // user routes
router.use("/auth", require("./auth.routes")); // auth routes

module.exports = router;
