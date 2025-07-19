const jwt = require("jsonwebtoken");

const getJsonWebToken = (email, id, role) => {
  const payload = { email, id, role };
  const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: "1d" });
  return token;
};

module.exports = getJsonWebToken;
