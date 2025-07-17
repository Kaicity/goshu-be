const Routers = require("express");
const { login } = require("../controllers/authController");
const errorMiddlewareHandle = require("../middlewares/errorMiddleware");

const authRouter = Routers();

authRouter.post("/login", login);

module.exports = authRouter;
