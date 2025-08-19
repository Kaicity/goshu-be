const mongoose = require('mongoose');
const { getCurrentTime } = require('../utils/timeZone');
const PayrollStatus = require('../enums/payrollStatus');

const PayrollSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'employees', required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  basicSalary: { type: Number, required: true },
  allowance: { type: Number, default: 0 },
  overtime: { type: Number, default: 0 },
  deductions: { type: Number, default: 0 },
  netSalary: { type: Number },
  status: {
    type: String,
    enum: [PayrollStatus.OPEN, PayrollStatus.CALCULATED, PayrollStatus.CLOSED],
    default: PayrollStatus.OPEN,
  },
  createdAt: { type: Date, default: getCurrentTime() },
  updatedAt: { type: Date, default: getCurrentTime() },
});

const PayrollModel = mongoose.model('payrolls', PayrollSchema);

module.exports = PayrollModel;
