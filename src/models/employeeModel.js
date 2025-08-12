const mongoose = require('mongoose');
const UserStatus = require('../enums/userStatus');
const EmployeeGender = require('../enums/employeeGender');
const EmployeeType = require('../enums/employeeTypes');
const MaritalStatus = require('../enums/maritalStatus');

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
  internalEmail: {
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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'departments',
  },
  status: {
    type: String,
    enum: [UserStatus.ACTIVE, UserStatus.INACTIVE, UserStatus.SUSPENDED, UserStatus.PENDING],
  },
  marital: {
    type: String,
    enum: [MaritalStatus.SINGLE, MaritalStatus.MARRIED, MaritalStatus.DIVORCED],
  },
  country: {
    type: String,
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
