const Router = require('express');
const { checkIn, checkOut, getAllAttendance, getAllAttendanceByEmployee } = require('../controllers/attendance.controller');
const authorizeRole = require('../middlewares/authorizeRole');
const UserRoles = require('../enums/userRoles');

const attendanceRouter = new Router();

attendanceRouter.post('/checkin', checkIn);
attendanceRouter.post('/checkout', checkOut);
attendanceRouter.get('/getAllByEmployee', getAllAttendanceByEmployee);
attendanceRouter.get('/getAll', authorizeRole(UserRoles.ADMIN, UserRoles.HR), getAllAttendance);

module.exports = attendanceRouter;
