const User = require("../models/User");
const Response = require("../utils/Response");

// * GET users
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find();

    Response.send(res, 200, "success", undefined, users.length, { users });
  } catch (e) {
    next(e);
  }
};

// * GET user by id
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    Response.send(res, 200, "success", undefined, { user });
  } catch (e) {
    next(e);
  }
};
