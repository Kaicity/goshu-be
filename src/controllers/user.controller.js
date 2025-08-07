const asyncHandle = require('express-async-handler');
const paginate = require('../utils/paginate');

const {
  createAccountService,
  verificationService,
  forgotPasswordService,
  changePasswordService,
  getAllUsersService,
  deleteAccountService,
  getUserService,
  updateUserService,
} = require('../services/user.service');

const verification = asyncHandle(async (req, res) => {
  const { email } = req.body;

  const result = await verificationService({ email });

  res.status(200).json({
    message: 'Gửi mã xác nhận thành công',
    ...result,
  });
});

const forgotPassword = asyncHandle(async (req, res) => {
  const { email } = req.body;

  const result = await forgotPasswordService({ email });

  res.status(200).json({
    message: 'Mã số đã được gửi đến Email tài khoản này',
    ...result,
  });
});

const changePassword = asyncHandle(async (req, res) => {
  await changePasswordService(req.body);

  res.status(200).json({
    message: 'Đổi mật khẩu người dùng thành công',
    data: [],
  });
});

const getAllUsers = asyncHandle(async (req, res) => {
  const { page, limit, skip, search } = paginate(req);
  const { role, status } = req.query;

  const result = await getAllUsersService({ page, limit, skip, search }, { role, status });

  res.status(200).json({
    message: 'get list users successfully',
    ...result,
  });
});

const createAccount = asyncHandle(async (req, res) => {
  const result = await createAccountService(req.body);

  res.status(200).json({
    message: 'Tạo tài khoản người dùng thành công',
    ...result,
  });
});

const deleteAccount = asyncHandle(async (req, res) => {
  const { id } = req.params;

  await deleteAccountService(id);

  res.status(200).json({
    message: 'Xóa tài khoản người dùng thành công',
    data: {},
  });
});

const getUser = asyncHandle(async (req, res) => {
  const { email } = req.query;

  const result = await getUserService({ email });

  res.status(200).json({
    message: 'Get user detail successfully',
    ...result,
  });
});

const updateUser = asyncHandle(async (req, res) => {
  const { id } = req.params;

  const result = await updateUserService(id);

  res.status(200).json({
    message: 'Cập nhật tài khoản thành công',
    ...result,
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
