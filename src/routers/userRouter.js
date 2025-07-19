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

const userRouter = Routers();
userRouter.get('/getAll', authorizeRole(UserRoles.ADMIN, UserRoles.HR), getAllUsers);
userRouter.post('/createAccount', authorizeRole(UserRoles.ADMIN, UserRoles.HR), createAccount);
userRouter.post('/verification', verification);
userRouter.post('/forgotPassword', forgotPassword);
userRouter.post('/changePassword', changePassword);
userRouter.delete('/deleteAccount/:id', authorizeRole(UserRoles.ADMIN), deleteAccount);
userRouter.get('/getUser/:id', authorizeRole(UserRoles.ADMIN, UserRoles.HR), getUser);
userRouter.put('/updateAccount/:id', authorizeRole(UserRoles.ADMIN, UserRoles.HR), updateUser);

module.exports = userRouter;
