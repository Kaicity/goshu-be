const Routers = require("express");
const {
  getAllUsers,
  createAccount,
  verification,
  forgotPassword,
  changePassword,
  deleteAccount,
  getUser,
  updateUser,
} = require("../controllers/userController");

const userRouter = Routers();
userRouter.get("/getAll", getAllUsers);
userRouter.post("/createAccount", createAccount);
userRouter.post("/verification", verification);
userRouter.post("/forgotPassword", forgotPassword);
userRouter.post("/changePassword", changePassword);
userRouter.delete("/deleteAccount/:id", deleteAccount);
userRouter.get("/getUser/:id", getUser);
userRouter.put("/updateAccount/:id", updateUser);

module.exports = userRouter;
