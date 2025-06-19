const Routers = require("express");
const { getAllUsers } = require("../controllers/userController");

const userRouter = Routers();
userRouter.get("/getAll", getAllUsers);

module.exports = userRouter;
