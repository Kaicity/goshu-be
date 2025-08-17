const Router = require('express');
const { checkIn, checkOut } = require('../controllers/attendance.controller');

const attendanceRouter = new Router();

attendanceRouter.post('/checkin', checkIn);
attendanceRouter.post('/checkout', checkOut);

module.exports = attendanceRouter;
