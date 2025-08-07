const mongoose = require('mongoose');
const UserStatus = require('../enums/userStatus');
const EmployeeGender = require('../enums/employeeGender');
const EmployeeType = require('../enums/employeeTypes');

const EmployeeSchema = new mongoose.Schema({
  fullname: {
    type: String,
  },
  username: {
    type: String,
  },
  employeeCode: {
    type: String,
    required: true,
  },
  email: {
    type: String,
  },
  githubId: {
    type: String,
  },
  slackId: {
    type: String,
  },
  microsoftTeamId: {
    type: String,
  },
  address: {
    type: String,
  },
  phone: {
    type: String,
  },
  birthday: {
    type: Date,
  },
  gender: {
    type: String,
    enum: [EmployeeGender.MALE, EmployeeGender.FEMALE],
  },
  designation: {
    type: String,
  },
  type: {
    type: String,
    enum: [EmployeeType.OFFICE, EmployeeType.REMOTE],
  },
  joinDate: {
    type: Date,
  },
  workingDate: {
    type: Date,
  },
  avatarUrl: {
    type: String,
  },
  document: {
    type: [String],
  },
  departmentId: {
    type: String,
  },
  status: {
    type: String,
    enum: [UserStatus.ACTIVE, UserStatus.INACTIVE, UserStatus.SUSPENDED, UserStatus.PENDING],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  updatedAt: {
    type: Date,
    default: Date.now(),
  },
});

const EmployeeModel = mongoose.model('employees', EmployeeSchema);

module.exports = EmployeeModel;
