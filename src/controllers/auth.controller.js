const asyncHandle = require('express-async-handler');
const { authService } = require('../services/auth.service');

const login = asyncHandle(async (req, res) => {
  const { email, password } = req.body;
  const { user, accessToken } = await authService({ email, password });

  res.status(200).json({
    message: 'Login is sucessfully',
    data: {
      employeeId: user.employeeId,
      email: user.email,
      role: user.role,
      accesstoken: accessToken,
    },
  });
});

module.exports = {
  login,
};
