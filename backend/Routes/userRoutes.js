const express = require('express');
const router = express.Router();
const { registerUser, updateUser } = require('../controllers/userController');

router.post('/register', registerUser);
router.put('/update',updateUser)
router.post('/send-email-otp',emailController.sendEmailOTP)
router.post('/verify-email-otp',emailController.verifyEmailOTP)
router.post('/send-aadhar-otp',refreshToken,verificationController.aadhaarOTP)
router.post('/verify-aadhar-otp',refreshToken,verificationController.aadharVerify)
router.post('/verify-pan',refreshToken,verificationController.panVerify)
router.post('/verify-bank-account',refreshToken,verificationController.bankVerify)
router.post('/verify-gstin',refreshToken,verificationController.gstVerify)


module.exports = router;
