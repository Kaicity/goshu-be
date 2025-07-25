const Routers = require('express');
const {
  getAllUsers,
  createAccount,
  verification,
  forgotPassword,
  changePassword,
  deleteAccount,
  getUser,
  updateUser,
} = require('../controllers/userController');
const authorizeRole = require('../middlewares/authorizeRole');
const UserRoles = require('../enums/userRoles');
const verifyToken = require('../middlewares/verifyMiddleware');

const userRouter = Routers();
userRouter.get('/getAll', verifyToken, authorizeRole(UserRoles.ADMIN, UserRoles.HR), getAllUsers);
userRouter.post('/createAccount', verifyToken, authorizeRole(UserRoles.ADMIN, UserRoles.HR), createAccount);
userRouter.post('/verification', verification);
userRouter.post('/forgotPassword', forgotPassword);
userRouter.post('/changePassword', changePassword);
userRouter.delete('/deleteAccount/:id', verifyToken, authorizeRole(UserRoles.ADMIN), deleteAccount);
userRouter.get('/getUser', verifyToken, authorizeRole(UserRoles.ADMIN, UserRoles.HR), getUser);
userRouter.put('/updateAccount/:id', verifyToken, authorizeRole(UserRoles.ADMIN, UserRoles.HR), updateUser);

module.exports = userRouter;
