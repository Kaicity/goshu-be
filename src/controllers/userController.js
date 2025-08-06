const asyncHandle = require('express-async-handler');
const UserModel = require('../models/userModel');
const EmployeeModel = require('../models/employeeModel');
const hashPassword = require('../utils/hashPassword');
const generateRandomCode = require('../utils/digitCodeRandom');
const nodemailer = require('nodemailer');
const paginate = require('../utils/paginate');
const { isValidObjectId } = require('mongoose');
const UserStatus = require('../enums/userStatus');
const { verificationData, forgotPasswordData } = require('../constants/mailerTheme');
const { getIO } = require('../configs/socket');
const UserRoles = require('../enums/userRoles');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
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
    return 'SUCCESS';
  } catch (error) {
    return error;
  }
};

const verification = asyncHandle(async (req, res) => {
  const { email } = req.body;

  //Check existing email account
  const userExisting = await UserModel.findOne({ email });

  if (userExisting) {
    res.status(409);
    throw new Error('Tài khoản Email đã được đăng ký');
  }

  const verificationCode = Math.round(1000 + Math.random() * 9000);

  const data = verificationData(verificationCode, email);

  await handleSendEmail(data);

  res.status(200).json({
    message: 'Gửi mã xác nhận thành công',
    data: {
      code: verificationCode,
    },
  });
});

const forgotPassword = asyncHandle(async (req, res) => {
  const { email } = req.body;

  const resetCode = Math.floor(100000 + Math.random() * 900000);

  const data = forgotPasswordData(resetCode, email);

  const user = await UserModel.findOne({ email });

  if (user) {
    await handleSendEmail(data);

    res.status(200).json({
      message: 'Điền mã số đã được gửi đến Email tài khoản này',
      data: { resetCode },
    });
  } else {
    res.status(404);
    throw new Error('Không tìm thấy tài khoản người dùng này');
  }
});

const changePassword = asyncHandle(async (req, res) => {
  const { email, password } = req.body;

  console.log(email, password);

  const user = await UserModel.findOne({ email });

  if (!user) {
    res.status(403);
    throw new Error('Không tìm thấy tài khoản người dùng này');
  }

  const hashedPassword = await hashPassword(password);

  await UserModel.findByIdAndUpdate(user._id, {
    password: hashedPassword,
  });

  res.status(200).json({
    message: 'Đổi mật khẩu người dùng thành công',
    data: [],
  });
});

const getAllUsers = asyncHandle(async (req, res) => {
  const { page, limit, skip, search } = paginate(req);
  const { role, status } = req.query;

  const query = {};

  if (search) {
    query.$or = [{ email: { $regex: search, $options: 'i' } }];
  }

  if (role) query.role = role;
  if (status) query.status = status;

  const [total, users] = await Promise.all([
    UserModel.countDocuments(query),
    UserModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
  ]);

  const data = users.map((item) => ({
    id: item.id,
    email: item.email,
    role: item.role,
    employeeId: item.employeeId,
    status: item.status,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }));

  res.status(200).json({
    message: 'get list users successfully',
    data,
    pagination: {
      totalItems: total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      limit,
    },
  });
});

const createAccount = asyncHandle(async (req, res) => {
  const { email, password, role, status } = req.body;

  const existingUser = await UserModel.findOne({ email });

  if (existingUser) {
    res.status(409);
    throw new Error('Tên tài khoản Email người dùng đã tồn tại');
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
    status: status ? status : UserStatus.PENDING,
  });

  await newUser.save();
  await newEmployee.save();

  // đẩy sự kiện cho client
  const io = getIO();
  io.emit('user:added', { email: newUser.email });

  res.status(200).json({
    message: 'Tạo tài khoản người dùng thành công',
    data: {
      email: newUser.email,
      employeeCode: newEmployee.employeeCode,
    },
  });
});

const deleteAccount = asyncHandle(async (req, res) => {
  const { id } = req.params;

  // Kiểm tra object id đúng với mongo trước khi truyền vào trước khi find id
  if (!isValidObjectId(id)) {
    res.status(400);
    throw new Error('Invalid user ID format');
  }

  const user = await UserModel.findById(id);

  if (!user) {
    res.status(404);
    throw new Error('Không tìm thấy tài khoản này');
  }

  if (user) {
    const userRole = user.role;

    if (userRole === UserRoles.ADMIN) {
      res.status(403);
      throw new Error('Không thể xóa với tài khoản là Admin');
    }
  }

  const employee = await EmployeeModel.findById(user.employeeId);

  await UserModel.findByIdAndDelete(id);
  await EmployeeModel.findByIdAndDelete(employee._id.toString());

  res.status(200).json({
    message: 'Xóa tài khoản người dùng thành công',
    data: { userId: id },
  });
});

const getUser = asyncHandle(async (req, res) => {
  const { email } = req.query;

  const user = await UserModel.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error('Không tìm thấy tài khoản này');
  }

  res.status(200).json({
    message: 'Get user detail successfully',
    data: {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      employeeId: user.employeeId,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  });
});

const updateUser = asyncHandle(async (req, res) => {
  const { id } = req.params;

  // Kiểm tra object id hợp lệ
  if (!isValidObjectId(id)) {
    res.status(400);
    throw new Error('Invalid user ID format');
  }

  const user = await UserModel.findById(id);

  if (!user) {
    res.status(404);
    throw new Error('Không tìm thấy tài khoản này');
  }

  // update data
  const { email, role, status, password } = req.body;

  if (email && email !== user.email) {
    const existingEmailUser = await UserModel.findOne({ email });

    if (existingEmailUser) {
      res.status(409);
      throw new Error('Tài khoản Email người dùng đã tồn tại');
    }

    user.email = email;
  }

  if (role) user.role = role;
  if (status) user.status = status;
  if (password) user.password = await hashPassword(password);

  user.updatedAt = Date.now();

  const updatedUser = await user.save();

  res.status(200).json({
    message: 'Cập nhật tài khoản thành công',
    data: {
      id: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
      employeeId: updatedUser.employeeId,
      updatedAt: Date.now(),
    },
  });
});

module.exports = {
  getAllUsers,
  createAccount,
  verification,
  changePassword,
  forgotPassword,
  deleteAccount,
  getUser,
  updateUser,
};
