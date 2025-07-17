const asyncHandle = require("express-async-handler");
const UserModel = require("../models/userModel");

const getAllUsers = asyncHandle(async (req, res) => {
  const users = await UserModel.find();

  const data = [];
  users.forEach((item) =>
    data.push({
      id: item.id,
      email: item.email,
    })
  );

  res.status(200).json({
    message: "get users successfully",
    data,
  });
});

module.exports = { getAllUsers };
