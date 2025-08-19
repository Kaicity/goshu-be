const mongoose = require('mongoose');
const { getCurrentTime } = require('../utils/timeZone');

const PayrollSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'employees', required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  basicSalary: { type: Number, required: true },
  allowance: { type: Number, default: 0 },
  overtime: { type: Number, default: 0 },
  deductions: { type: Number, default: 0 },
  netSalary: { type: Number },
  createdAt: { type: Date, default: getCurrentTime() },
});

const PayrollModel = mongoose.model('payrolls', PayrollSchema);

module.exports = PayrollModel;
