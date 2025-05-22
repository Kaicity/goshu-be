const Routers = require("express");
const {
  register,
  login,
  verification,
  forgotPassword,
  changePassword,
} = require("../controllers/authController");
const errorMiddlewareHandle = require("../middlewares/errorMiddleware");

const authRouter = Routers();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/verification", verification);
authRouter.post("/forgotPassword", forgotPassword);
authRouter.post("/changePassword", changePassword);

module.exports = authRouter;
