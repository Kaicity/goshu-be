const express = require('express');
const {
  checkIn,
  checkOut,
  getAllAttendance,
  deleteAttendanceInMonth,
  updateAttendance,
  generateAttendanceManualForMonth,
  checkInByFace,
} = require('../controllers/attendance.controller');
const authorizeRole = require('../middlewares/authorizeRole');
const UserRoles = require('../enums/userRoles');
const multer = require('multer');

const attendanceRouter = express.Router();

const upload = multer({ dest: 'uploads/' });

attendanceRouter.post('/checkin', authorizeRole(UserRoles.EMPLOYEE, UserRoles.HR), checkIn);
attendanceRouter.post('/checkout', authorizeRole(UserRoles.EMPLOYEE, UserRoles.HR), checkOut);
attendanceRouter.get('/getAll', authorizeRole(UserRoles.EMPLOYEE, UserRoles.HR), getAllAttendance);
attendanceRouter.post('/generateAttendances', authorizeRole(UserRoles.HR), generateAttendanceManualForMonth);
attendanceRouter.delete('/deleteAttendances/:year/:month', authorizeRole(UserRoles.HR), deleteAttendanceInMonth);
attendanceRouter.post('/updateAttendance', authorizeRole(UserRoles.HR), updateAttendance);
attendanceRouter.post(
  '/checkinFace',
  upload.single('file'),
  authorizeRole(UserRoles.EMPLOYEE, UserRoles.HR),
  checkInByFace,
);

module.exports = attendanceRouter;
