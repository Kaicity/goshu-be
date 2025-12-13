require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRouter = require('./src/routers/auth.router');
const connectDB = require('./src/configs/connectDb');
const errorMiddlewareHandle = require('./src/middlewares/errorMiddleware');
const userRouter = require('./src/routers/user.router');
const seedAdminAccount = require('./src/seeds/seedUsersAccount');
const http = require('http');
const { setupSocket } = require('./src/configs/socket');
const employeeRouter = require('./src/routers/employee.router');
const departmentRouter = require('./src/routers/department.router');
const UserRoles = require('./src/enums/userRoles');
const verifyToken = require('./src/middlewares/verifyMiddleware');
const authorizeRole = require('./src/middlewares/authorizeRole');
const attendanceRouter = require('./src/routers/attendance.router');
const leaveRequestRouter = require('./src/routers/leave-request.router');
const payrollRouter = require('./src/routers/payroll.router');
// require('./src/cronJobs/attendanceJob');
const seedDepartment = require('./src/seeds/seedDepartment');

const app = express();
const server = http.createServer(app);

// Gắn socket vào server
setupSocket(server);

app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRouter);
app.use('/users', userRouter);
app.use('/employees', employeeRouter);
app.use('/departments', verifyToken, authorizeRole(UserRoles.HR), departmentRouter);
app.use('/attendances', verifyToken, attendanceRouter);
app.use('/leaveRequests/', verifyToken, leaveRequestRouter);
app.use('/payrolls/', payrollRouter);

// Route default when app running
app.get('/', (req, res) => {
  res.send('Goshu Backend is running');
});

const PORT = process.env.PORT || 3000;

connectDB();

// SEED DATA
seedAdminAccount();
seedDepartment();

app.use(errorMiddlewareHandle);

server.listen(PORT, (err) => {
  if (err) {
    console.log(err);
    return;
  }
  console.log(`🚀 Server + WebSocket đang chạy tại http://localhost:${PORT}`);
});
