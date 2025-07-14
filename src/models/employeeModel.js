const mongoose = require("mongoose");

const EmployeeSchema = new mongoose.Schema({
  fullname: {
    type: String,
  },
  employeeCode: {
    type: String,
    required: true,
  },
  email: {
    type: String,
  },
  address: {
    type: String,
  },
  phone: {
    type: Number,
  },
  birthday: {
    type: Date,
  },
  gender: {
    type: String,
  },
  position: {
    type: String,
  },
  joinDate: {
    type: Date,
  },
  avatarUrl: {
    type: String,
  },
  departmentId: {
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

const EmployeeModel = mongoose.model("employees", EmployeeSchema);

module.exports = EmployeeModel;
