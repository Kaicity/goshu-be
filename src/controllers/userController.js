const asyncHandle = require("express-async-handler");
const UserModel = require("../models/userModel");
const EmployeeModel = require("../models/employeeModel");
const hashPassword = require("../utils/hashPassword");
const generateRandomCode = require("../utils/digitCodeRandom");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.USERNAME_EMAIL,
    pass: process.env.PASSWORD,
  },
});

const handleSendEmail = async (val) => {
  try {
    await transporter.sendMail(val);
    return "OK";
  } catch (error) {
    return error;
  }
};

const verification = asyncHandle(async (req, res) => {
  const { email } = req.body;

  //Check existing email account
  const userExisting = await UserModel.findOne({ email });

  if (userExisting) {
    res.status(403);
    throw new Error("Email account already registed");
  }

  const verificationCode = Math.round(1000 + Math.random() * 9000);

  const data = {
    from: `Support Goshu System <${process.env.USERNAME_EMAIL}>`,
    to: email,
    subject: "Verification Email Code",
    text: "Your verification code has been sent to your email.",
    html: `
      <div style="font-family: Arial, sans-serif; background: #f7f7f7; padding: 30px;">
        <div style="max-width: 400px; margin: auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); padding: 24px;">
        <h2 style="color: #2d7ff9; text-align: center; margin-bottom: 16px;">Eventhub Verification</h2>
        <p style="font-size: 16px; color: #333; text-align: center;">
          Hello,<br>
          Please use the following verification code to complete your registration:
        </p>
        <div style="text-align: center; margin: 24px 0;">
          <span style="display: inline-block; background: #2d7ff9; color: #fff; font-size: 28px; letter-spacing: 4px; padding: 12px 32px; border-radius: 6px; font-weight: bold;">
          ${verificationCode}
          </span>
        </div>
        <p style="font-size: 14px; color: #888; text-align: center;">
          If you did not request this, please ignore this email.
        </p>
        <div style="text-align: center; margin-top: 24px;">
          <img src="https://img.icons8.com/color/48/000000/checked--v1.png" alt="Eventhub" style="width: 48px;"/>
        </div>
        </div>
      </div>
      `,
  };

  await handleSendEmail(data);

  res.status(200).json({
    message: "Send verification code successfully!",
    data: {
      code: verificationCode,
    },
  });
});

const forgotPassword = asyncHandle(async (req, res) => {
  const { email } = req.body;

  const resetCode = Math.floor(100000 + Math.random() * 900000);

  const data = {
    from: `EventHub Support <${process.env.USERNAME_EMAIL}>`,
    to: email,
    subject: "Your Password Reset Code - Goshu System",
    text: `Your password reset code is: ${resetCode}`,
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 40px;">
        <div style="max-width: 500px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
          <h2 style="text-align: center; color: #2d7ff9;">Reset Your Password</h2>
          <p style="font-size: 16px; color: #333;">Hi there,</p>
          <p style="font-size: 16px; color: #333;">We received a request to reset the password associated with this email address. If you made this request, use the code below to reset your password:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <span style="display: inline-block; font-size: 32px; color: #fff; background-color: #2d7ff9; padding: 14px 30px; border-radius: 8px; letter-spacing: 4px; font-weight: bold;">
              ${resetCode}
            </span>
          </div>

          <p style="font-size: 14px; color: #666;">This code will expire in 10 minutes. If you didn't request a password reset, you can safely ignore this email.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">

          <p style="font-size: 12px; color: #999; text-align: center;">
            &copy; ${new Date().getFullYear()} EventHub. All rights reserved.
          </p>
        </div>
      </div>
    `,
  };

  const user = await UserModel.findOne({ email });

  if (user) {
    await handleSendEmail(data);

    res.status(200).json({
      message: "A reset code has been sent to your email address.",
      data: { resetCode },
    });
  } else {
    res.status(401);
    throw new Error("User not found!");
  }
});

const changePassword = asyncHandle(async (req, res) => {
  const { email, password } = req.body;

  console.log(email, password);

  const user = await UserModel.findOne({ email });

  if (!user) {
    res.status(403);
    throw new Error("User not found!");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  await UserModel.findByIdAndUpdate(user._id, {
    password: hashedPassword,
  });

  res.status(200).json({
    message: "Change password sucessfully",
    data: [],
  });
});

const getAllUsers = asyncHandle(async (req, res) => {
  const users = await UserModel.find();

  const data = [];
  users.forEach((item) =>
    data.push({
      id: item.id,
      email: item.email,
      role: item.role,
      employeeId: item.employeeId,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
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

const deleteAccount = asyncHandle(async (req, res) => {
  const { id } = req.params;

  const user = await UserModel.findById(id);

  const employee = await EmployeeModel.findById(user.employeeId);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (!employee) {
    res.status(404);
    throw new Error("Employee not found");
  }

  await UserModel.findByIdAndDelete(id);
  await EmployeeModel.findByIdAndDelete(employee._id.toString());

  res.status(200).json({
    message: "User deleted successfully",
    data: { userId: id },
  });
});

module.exports = {
  getAllUsers,
  createAccount,
  verification,
  changePassword,
  forgotPassword,
  deleteAccount,
};
