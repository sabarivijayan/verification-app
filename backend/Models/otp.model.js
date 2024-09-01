const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  token: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now, expires: 300 } // Expires in 5 minutes
});

const OTP = mongoose.model('OTP', otpSchema);

module.exports = OTP;