const mongoose = require('mongoose');
const LeaveRequestStatus = require('../enums/leaveRequestStatus');
const { getCurrentTime } = require('../utils/timeZone');

const LeaveRequestSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'employees', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String },
  status: {
    type: String,
    enum: [LeaveRequestStatus.PENDING, LeaveRequestStatus.APPROVED, LeaveRequestStatus.REJECTED],
    default: LeaveRequestStatus.PENDING,
  },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'employees' },
  note: { type: String },
  createdAt: { type: Date, default: getCurrentTime() },
});

const LeaveRequestModel = mongoose.model('leave_requests', LeaveRequestSchema);

module.exports = LeaveRequestModel;
