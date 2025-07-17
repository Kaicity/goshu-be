const Routers = require("express");
const {
  getAllUsers,
  createAccount,
  verification,
  forgotPassword,
  changePassword,
} = require("../controllers/userController");

const userRouter = Routers();
userRouter.get("/getAll", getAllUsers);
userRouter.post("/createAccount", createAccount);
userRouter.post("/verification", verification);
userRouter.post("/forgotPassword", forgotPassword);
userRouter.post("/changePassword", changePassword);

module.exports = userRouter;
