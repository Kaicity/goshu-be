const asyncHandler = require('express-async-handler');

/**
 * Check if user has one of the allowed roles
 * @param  {...string} roles
 * @returns middleware
 */
const authorizeRole = (...roles) => {
  return asyncHandler((req, res, next) => {
    const user = req.user;

    if (!user || !roles.includes(user.role)) {
      res.status(403);
      throw new Error('Forbidden: You do not have permission');
    }

    next();
  });
};

module.exports = authorizeRole;
