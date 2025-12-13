const UserModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const getJsonWebToken = require('../utils/jwt');
const UserStatus = require('../enums/userStatus');

const authService = async ({ email, password }) => {
  const user = await UserModel.findOne({ email });

  if (!user) {
    const err = new Error('Tài khoản người dùng không tồn tại');
    err.statusCode = 404;
    throw err;
  }

  const isMatchPassword = await bcrypt.compare(password, user.password);
  if (!isMatchPassword) {
    const err = new Error('Tài khoản hoặc mật khẩu không đúng');
    err.statusCode = 400;
    throw err;
  }

  if (user.status === UserStatus.SUSPENDED) {
    const err = new Error('Rất tiếc tài khoản người dùng đang tạm dừng!');
    err.statusCode = 403;
    throw err;
  }

  const accessToken = await getJsonWebToken(email, user.id, user.role);

  await UserModel.findByIdAndUpdate(user._id, {
    currentToken: accessToken,
  });

  return { user, accessToken };
};

module.exports = { authService };
