const jwt = require("jsonwebtoken");
const asyncHandle = require("express-async-handler");
const UserModel = require("../models/userModel");

const verifyToken = asyncHandle(async (req, res, next) => {
  const accessToken = req.headers.authorization;
  const token = accessToken && accessToken.split(" ")[1];

  if (!token) {
    res.status(401);
    throw new Error("Un authorization!!");
  } else {
    try {
      const decoded = jwt.verify(token, process.env.SECRET_KEY);

      const user = await UserModel.findById(decoded.id);

      if (!user || user.currentToken !== token) {
        res.status(403);
        throw new Error("Token is expired or invalid");
      }

      req.user = decoded;
      next();
    } catch (error) {
      res.status(403);
      throw new Error("Invalid or expired token");
    }
  }
});

module.exports = verifyToken;
