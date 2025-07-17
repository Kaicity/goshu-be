const Routers = require("express");
const { getAllUsers, createAccount } = require("../controllers/userController");

const userRouter = Routers();
userRouter.get("/getAll", getAllUsers);
userRouter.post("/createAccount", createAccount);

module.exports = userRouter;
