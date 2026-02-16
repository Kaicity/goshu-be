const express = require('express');
const { registerFace } = require('../controllers/registerFace.controller');
const multer = require('multer');

const faceProfileRouter = express.Router();

const upload = multer({ dest: 'uploads/' });

faceProfileRouter.post('/registerFace', upload.single('file'), registerFace);

module.exports = faceProfileRouter;
