const express = require('express');
const {
  getAllUsers,
  createAccount,
  verification,
  forgotPassword,
  changePassword,
  deleteAccount,
  getUser,
  updateUser,
} = require('../controllers/user.controller');
const authorizeRole = require('../middlewares/authorizeRole');
const UserRoles = require('../enums/userRoles');
const verifyToken = require('../middlewares/verifyMiddleware');

const userRouter = express.Router();
userRouter.get('/getAll', verifyToken, authorizeRole(UserRoles.ADMIN), getAllUsers);
userRouter.post('/createAccount', verifyToken, authorizeRole(UserRoles.ADMIN), createAccount);
userRouter.post('/verification', verification);
userRouter.post('/forgotPassword', forgotPassword);
userRouter.post('/changePassword', changePassword);
userRouter.delete('/deleteAccount/:id', verifyToken, authorizeRole(UserRoles.ADMIN), deleteAccount);
userRouter.get('/getUser', verifyToken, getUser);
userRouter.put('/updateAccount/:id', verifyToken, authorizeRole(UserRoles.ADMIN), updateUser);

module.exports = userRouter;
