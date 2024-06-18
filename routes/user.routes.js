const express = require("express");
const router = express.Router();

const { getUsers, getUser } = require("../controller/user.controller");

// * User Endpoints
router.route("/").get(getUsers);
router.route("/:id").get(getUser);

module.exports = router;
