const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const FaceProfileModel = require('../models/faceProfileModel');
const EmployeeModel = require('../models/employeeModel');

const BASE_URL = process.env.EXACT_FACE_ID_PORT;

const registerFaceService = async (employeeId, imagePath) => {
  const form = new FormData();
  form.append('file', fs.createReadStream(imagePath));

  const employee = await EmployeeModel.findById(employeeId);
  if (!employee) {
    const err = new Error('Nhân viên không tồn tại');
    err.statusCode = 400;
    throw err;
  }

  const existedFace = await FaceProfileModel.findOne({ employeeId });
  if (existedFace) {
    const err = new Error('Nhân viên đã đăng ký khuôn mặt');
    err.statusCode = 400;
    throw err;
  }

  try {
    const res = await axios.post(`${BASE_URL}/api/v1/extract-face-ID`, form, {
      headers: form.getHeaders(),
    });

    const doc = await FaceProfileModel.create({
      employeeId,
      embedding: res.data.embedding,
    });

    const data = {
      embedding: doc.embedding,
    };

    return data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 400) {
      const e = new Error(err.response.data?.detail || 'Ảnh không hợp lệ');
      e.statusCode = 400;
      throw e;
    }
    throw err;
  }
};

module.exports = { registerFaceService };
