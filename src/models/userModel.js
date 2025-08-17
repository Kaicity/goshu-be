const mongoose = require('mongoose');
const userRole = require('../enums/userRoles');
const UserStatus = require('../enums/userStatus');
const { getCurrentTime } = require('../utils/timeZone');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: [userRole.ADMIN, userRole.HR, userRole.EMPLOYEE],
    required: true,
  },
  employeeId: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: [UserStatus.ACTIVE, UserStatus.INACTIVE, UserStatus.SUSPENDED, UserStatus.PENDING],
    require,
  },
  currentToken: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: getCurrentTime(),
  },
  updatedAt: {
    type: Date,
    default: getCurrentTime(),
  },
});

const UserModel = mongoose.model('users', UserSchema);

module.exports = UserModel;
