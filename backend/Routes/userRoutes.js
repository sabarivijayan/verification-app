const express = require('express');
const router = express.Router();
const { registerUser, updateUser } = require('../Controller/userController');
// Import email and user controllers
const emailController = require('../Controller/emailController');
const userController = require('../Controller/userController');

// Import the combined verification controller
const verificationController = require('../Controller/verificationController');



router.post('/register', registerUser);
router.put('/update',updateUser)
// Define routes for email OTP
router.post('/send-email-otp', emailController.sendEmailOTP);
router.post('/verify-email-otp',emailController.verifyEmailOTP)
// Define routes for Aadhar OTP and verification
router.post('/aadhar/otp', verificationController.aadharOTP);
router.post('/aadhar/verify', verificationController.aadharVerify);

// Define routes for PAN verification
router.post('/pan/verify', verificationController.panVerify);

// Define routes for bank account verification
router.post('/bank/verify', verificationController.bankVerify);

// Define routes for GST verification
router.post('/gst/verify', verificationController.gstVerify);

module.exports = router;




// const express = require('express');
// const router = express.Router();
// const { registerUser, updateUser } = require('../Controller/userController');
// const emailController = require('../Controller/emailController');
// const refreshToken = require('../Middleware/token.middleware');
// const verificationController = require('../Controller/verificationController');





// router.post('/register', registerUser);
// router.put('/update',updateUser)
// router.post('/send-email-otp',emailController.sendEmailOTP)
// router.post('/verify-email-otp',emailController.verifyEmailOTP)
// router.post('/send-aadhar-otp',refreshToken,verificationController.aadhaarOTP)
// router.post('/verify-aadhar-otp',refreshToken,verificationController.aadharVerify)
// router.post('/verify-pan',refreshToken,verificationController.panVerify)
// router.post('/verify-bank-account',refreshToken,verificationController.bankVerify)
// router.post('/verify-gstin',refreshToken,verificationController.gstVerify)





// module.exports = router;
