const asyncHandle = require("express-async-handler");
const UserModel = require("../models/userModel");
const EmployeeModel = require("../models/employeeModel");
const hashPassword = require("../utils/hashPassword");
const generateRandomCode = require("../utils/digitCodeRandom");

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

const createAccount = asyncHandle(async (req, res) => {
  const { email, password, role } = req.body;

  const existingUser = await UserModel.findOne({ email });

  if (existingUser) {
    res.status(401);
    throw new Error("User has already exist!");
  }

  // Create account users and employee
  const employeeCode = generateRandomCode();

  // EMPLOYEE
  const newEmployee = new EmployeeModel({
    email,
    employeeCode,
  });

  // USER
  const hashedPassword = await hashPassword(password);

  const newUser = new UserModel({
    email,
    password: hashedPassword,
    employeeId: newEmployee._id.toString(),
    role,
  });

  await newUser.save();
  await newEmployee.save();

  res.status(200).json({
    message: "Register new user is successfully",
    data: {
      email: newUser.email,
      employeeCode: newEmployee.employeeCode,
    },
  });
});

module.exports = { getAllUsers, createAccount };
