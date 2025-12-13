const mongoose = require('mongoose');
const userRole = require('../enums/userRoles');
const UserStatus = require('../enums/userStatus');

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
  },
  status: {
    type: String,
    enum: [UserStatus.ACTIVE, UserStatus.SUSPENDED],
    require,
  },
  currentToken: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const UserModel = mongoose.model('users', UserSchema);

module.exports = UserModel;
