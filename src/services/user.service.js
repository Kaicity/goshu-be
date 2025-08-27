const UserModel = require('../models/userModel');
const EmployeeModel = require('../models/employeeModel');
const hashPassword = require('../utils/hashPassword');
const generateRandomCode = require('../utils/digitCodeRandom');
const { isValidObjectId } = require('mongoose');
const UserStatus = require('../enums/userStatus');
const { verificationData, forgotPasswordData } = require('../constants/mailerTheme');
const { getIO } = require('../configs/socket');
const UserRoles = require('../enums/userRoles');
const handleSendEmailService = require('../services/mailer.service');

const createAccountService = async (createData) => {
  const { email, password, role, status } = createData;

  const existingUser = await UserModel.findOne({ email });

  if (existingUser) {
    const error = new Error('Tên tài khoản Email người dùng đã tồn tại');
    error.statusCode = 409;
    throw error;
  }

  // Tạo mã nhân viên
  const employeeCode = generateRandomCode();

  //Nếu là admin không cần tạo nhân viên ở đây
  let newEmployee;
  if (role !== UserRoles.ADMIN) {
    // Khởi tạo nhân viên
    newEmployee = new EmployeeModel({
      email: email,
      employeeCode: employeeCode,
    });

    await newEmployee.save();
  }
  // Mã hoá mật khẩu và khởi tạo tài khoản
  const hashedPassword = await hashPassword(password);

  const newUser = new UserModel({
    email,
    password: hashedPassword,
    employeeId: newEmployee ? newEmployee.id : undefined,
    role,
    status: status || UserStatus.PENDING,
  });

  // Lưu vào DB
  await newUser.save();

  // Đẩy sự kiện socket
  const io = getIO();
  io.emit('user:added', { email: newUser.email });

  const data = { email: newUser.email, employeeCode: newEmployee ? newEmployee.employeeCode : undefined };

  return { data };
};

const verificationService = async ({ email }) => {
  //Check existing email account
  const userExisting = await UserModel.findOne({ email });

  if (userExisting) {
    const err = new Error('Tài khoản Email đã được đăng ký');
    err.statusCode = 409;
    throw err;
  }

  const verificationCode = Math.round(1000 + Math.random() * 9000);

  const sendData = verificationData(verificationCode, email);

  await handleSendEmailService(sendData);

  const data = { code: verificationCode };

  return { data };
};

const forgotPasswordService = async ({ email }) => {
  const resetCode = Math.floor(100000 + Math.random() * 900000);

  const sendData = forgotPasswordData(resetCode, email);

  const user = await UserModel.findOne({ email });

  if (!user) {
    const err = new Error('Not found user account');
    err.statusCode = 404;
    throw err;
  }

  await handleSendEmailService(sendData);

  const data = { resetCode };

  return { data };
};

const changePasswordService = async (changePasswordData) => {
  const { email, password } = changePasswordData;

  const user = await UserModel.findOne({ email });

  if (!user) {
    const err = new Error('Not found user account');
    err.statusCode = 403;
    throw err;
  }

  const hashedPassword = await hashPassword(password);

  await UserModel.findByIdAndUpdate(user._id, {
    password: hashedPassword,
  });
};

const getAllUsersService = async ({ page, limit, skip, search }, { role, status }) => {
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

  return {
    data,
    pagination: {
      totalItems: total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      limit,
    },
  };
};

const deleteAccountService = async (id) => {
  // Kiểm tra object id đúng với mongo trước khi truyền vào trước khi find id
  if (!isValidObjectId(id)) {
    const err = new Error('Invalid user ID format');
    err.statusCode = 400;
    throw err;
  }

  const user = await UserModel.findById(id);

  if (!user) {
    const err = new Error('Not found user account');
    err.statusCode = 404;
    throw err;
  }

  if (user) {
    const userRole = user.role;

    if (userRole === UserRoles.ADMIN) {
      const err = new Error('Không thể xóa với tài khoản là Admin');
      err.statusCode = 403;
      throw err;
    }
  }

  const employee = await EmployeeModel.findById(user.employeeId);

  await UserModel.findByIdAndDelete(id);
  await EmployeeModel.findByIdAndDelete(employee._id);
};

const getUserService = async ({ email }) => {
  const user = await UserModel.findOne({ email });

  if (!user) {
    const err = new Error('Not found user account');
    err.statusCode = 404;
    throw err;
  }

  const data = {
    id: user._id,
    email: user.email,
    role: user.role,
    employeeId: user.employeeId,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  return { data };
};

const updateUserService = async (id, updateData) => {
  // Kiểm tra object id hợp lệ
  if (!isValidObjectId(id)) {
    const err = new Error('Invalid user ID format');
    err.statusCode = 400;
    throw err;
  }

  const user = await UserModel.findById(id);

  if (!user) {
    const err = new Error('Không tìm thấy tài khoản trong hệ thống');
    err.statusCode = 404;
    throw err;
  }

  // update data
  const { email, role, status, password } = updateData;

  if (email && email !== user.email) {
    const existingEmailUser = await UserModel.findOne({ email });

    if (existingEmailUser) {
      const err = new Error('Tài khoản Email người dùng đã tồn tại');
      err.statusCode = 409;
      throw err;
    }

    user.email = email;
  }

  if (role) user.role = role;
  if (status) user.status = status;
  if (password) user.password = await hashPassword(password);

  user.updatedAt = new Date();

  // Đẩy sự kiện socket
  const io = getIO();
  status && io.emit('user:update-status', { email: user.email, status: status });

  const updatedUser = await user.save();

  const data = {
    id: updatedUser.id,
    email: updatedUser.email,
    role: updatedUser.role,
    employeeId: updatedUser.employeeId,
    updatedAt: updatedUser.updatedAt,
  };

  return { data };
};

module.exports = {
  createAccountService,
  verificationService,
  forgotPasswordService,
  changePasswordService,
  getAllUsersService,
  deleteAccountService,
  getUserService,
  updateUserService,
};
