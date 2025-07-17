const UserModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const asyncHandle = require("express-async-handler");
const getJsonWebToken = require("../utils/jwt");

const login = asyncHandle(async (req, res) => {
  const { email, password } = req.body;

  const existingUser = await UserModel.findOne({ email });

  if (!existingUser) {
    res.status(404);
    throw new Error("User not found");
  }

  const isMathPassword = await bcrypt.compare(password, existingUser.password);

  if (!isMathPassword) {
    res.status(401);
    throw new Error("Email or password not correct");
  }

  // Tạo token mới (refesh)
  const accessToken = await getJsonWebToken(email, existingUser.id);

  await UserModel.findByIdAndUpdate(existingUser._id, {
    currentToken: accessToken,
  });

  res.status(200).json({
    message: "Login is sucessfully",
    data: {
      employeeId: existingUser.employeeId,
      email: existingUser.email,
      role: existingUser.role,
      accesstoken: accessToken,
    },
  });
});

module.exports = {
  login,
};
