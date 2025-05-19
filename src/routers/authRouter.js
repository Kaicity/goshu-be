const Routers = require("express");
const { register, login } = require("../controllers/authController");
const errorMiddlewareHandle = require("../middlewares/errorMiddleware");

const authRouter = Routers();

authRouter.post("/register", register);
authRouter.post("/login", login);

module.exports = authRouter;
