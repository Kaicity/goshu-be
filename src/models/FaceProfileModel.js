const mongoose = require('mongoose');

const FaceProfileSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'employees', required: true },
  embedding: { type: [Number], required: true }, // vector khuôn mặt
  createdAt: { type: Date, default: Date.now },
});

const FaceProfileModel = mongoose.model('face_profiles', FaceProfileSchema);

module.exports = FaceProfileModel;
