const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, unique: true, sparse: true },
    dob: { type: Date, required: true },
    aadhar: { type: String, unique: true, sparse: true },
    pan: { type: String, unique: true, sparse: true },
    bankAccount: { type: String, unique: true, sparse: true },
    gst: { type: String, unique: true, sparse: true },
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    isAadharVerified: { type: Boolean, default: false },
    isPanVerified: { type: Boolean, default: false },
    isBankAccountVerified: { type: Boolean, default: false },
    isGstVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
