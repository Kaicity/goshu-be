const mongoose = require('mongoose');
const AttendanceStatus = require('../enums/attendanceStatus');

const AttendanceSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'employees',
    required: true,
  },
  date: {
    type: Date,
    required: true, // ngày chấm công (tính theo YYYY-MM-DD)
  },
  checkIn: {
    type: Date,
  },
  checkOut: {
    type: Date,
  },
  status: {
    type: String,
    enum: [AttendanceStatus.PRESENT, AttendanceStatus.LATE, AttendanceStatus.ONLEAVE],
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const AttendanceModel = mongoose.model('attendances', AttendanceSchema);

module.exports = AttendanceModel;
