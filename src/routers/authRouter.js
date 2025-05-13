const Routers = require("express");
const { register } = require("../controllers/authController");
const errorMiddlewareHandle = require("../middlewares/errorMiddleware");

const authRouter = Routers();

authRouter.post("/register", register);

module.exports = authRouter;
