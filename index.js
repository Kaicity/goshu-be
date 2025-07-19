require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRouter = require('./src/routers/authRouter');
const connectDB = require('./src/configs/connectDb');
const errorMiddlewareHandle = require('./src/middlewares/errorMiddleware');
const userRouter = require('./src/routers/userRouter');
const verifyToken = require('./src/middlewares/verifyMiddleware');
const seedAdminAccount = require('./src/seeds/seedUsersAccount');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', authRouter);
app.use('/users', verifyToken, userRouter);

const PORT = process.env.PORT;

connectDB();

// Create seed account system
seedAdminAccount();

app.use(errorMiddlewareHandle);

app.listen(PORT, (err) => {
  if (err) {
    console.log(err);
    return;
  }

  console.log(`Server starting at http://localhost:${PORT}`);
});
