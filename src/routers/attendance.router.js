const express = require('express');
const {
  checkIn,
  checkOut,
  getAllAttendance,
  deleteAttendanceInMonth,
  updateAttendance,
  generateAttendanceManualForMonth,
} = require('../controllers/attendance.controller');
const authorizeRole = require('../middlewares/authorizeRole');
const UserRoles = require('../enums/userRoles');

const attendanceRouter = express.Router();

attendanceRouter.post('/checkin', authorizeRole(UserRoles.EMPLOYEE, UserRoles.HR), checkIn);
attendanceRouter.post('/checkout', authorizeRole(UserRoles.EMPLOYEE, UserRoles.HR), checkOut);
attendanceRouter.get('/getAll', authorizeRole(UserRoles.EMPLOYEE, UserRoles.HR), getAllAttendance);
attendanceRouter.post('/generateAttendances', authorizeRole(UserRoles.HR), generateAttendanceManualForMonth);
attendanceRouter.delete('/deleteAttendances/:year/:month', authorizeRole(UserRoles.HR), deleteAttendanceInMonth);
attendanceRouter.post('/updateAttendance', authorizeRole(UserRoles.HR), updateAttendance);

module.exports = attendanceRouter;
