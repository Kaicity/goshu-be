const Router = require('express');
const { checkIn, checkOut, getAllAttendance, updateAttendance } = require('../controllers/attendance.controller');

const attendanceRouter = new Router();

attendanceRouter.post('/checkin', checkIn);
attendanceRouter.post('/checkout', checkOut);
attendanceRouter.get('/getAll', getAllAttendance);

module.exports = attendanceRouter;
