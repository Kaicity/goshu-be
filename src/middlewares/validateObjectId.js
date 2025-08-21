const mongoose = require('mongoose');

function validateObjectId(paramName = 'id') {
  return (req, res, next) => {
    const id = req.params[paramName] || req.body[paramName] || req.query[paramName];
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const err = new Error(`Invalid ${paramName} format`);
      err.statusCode = 400;
      return next(err);
    }
    next();
  };
}

module.exports = validateObjectId;
