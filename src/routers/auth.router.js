const Routers = require('express');
const { login } = require('../controllers/auth.controller');

const authRouter = Routers();

authRouter.post('/login', login);

module.exports = authRouter;
