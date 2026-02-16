const asyncHandle = require('express-async-handler');
const { registerFaceService } = require('../services/registerFace.service');

const registerFace = asyncHandle(async (req, res) => {
  const { employeeId } = req.body;
  const imagePath = req.file.path;

  const result = await registerFaceService(employeeId, imagePath);

  res.status(200).json({
    message: 'register your face ID sucessfully',
    ...result,
  });
});

module.exports = { registerFace };
