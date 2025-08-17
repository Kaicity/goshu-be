const mongoose = require('mongoose');
const AttendanceStatus = require('../enums/attendanceStatus');
const { getCurrentTime } = require('../utils/timeZone');

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
    enum: [AttendanceStatus.PRESENT, AttendanceStatus.ABSENT, AttendanceStatus.LATE, AttendanceStatus.ONLEAVE],
  },
  createdAt: { type: Date, default: getCurrentTime() },
});

const AttendanceModel = mongoose.model('attendances', AttendanceSchema);

module.exports = AttendanceModel;
