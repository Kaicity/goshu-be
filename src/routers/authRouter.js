const Routers = require("express");
const {
  register,
  login,
  verification,
} = require("../controllers/authController");
const errorMiddlewareHandle = require("../middlewares/errorMiddleware");

const authRouter = Routers();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/verification", verification);

module.exports = authRouter;
