require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRouter = require('./src/routers/authRouter');
const connectDB = require('./src/configs/connectDb');
const errorMiddlewareHandle = require('./src/middlewares/errorMiddleware');
const userRouter = require('./src/routers/userRouter');
const seedAdminAccount = require('./src/seeds/seedUsersAccount');
const http = require('http');
const { setupSocket } = require('./src/configs/socket');

const app = express();
const server = http.createServer(app);

// Gắn socket vào server
setupSocket(server);

app.use(cors());
app.use(express.json());

app.use('/auth', authRouter);
app.use('/users', userRouter);

const PORT = process.env.PORT || 3000;

connectDB();

// Create seed account system
seedAdminAccount();

app.use(errorMiddlewareHandle);

server.listen(PORT, (err) => {
  if (err) {
    console.log(err);
    return;
  }
  console.log(`🚀 Server + WebSocket đang chạy tại http://localhost:${PORT}`);
});
