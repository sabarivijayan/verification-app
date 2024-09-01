const OTP = require('../Models/otp.model');
const User = require('../Models/user.model');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Email transporter setup 
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

//OTP generator 
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

//Token generator
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

//OTP sender function
async function sendOTPEmail(email, otp) {
  await transporter.sendMail({
    from: `"mern user panel" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your OTP for Email Verification',
    text: `Your OTP is: ${otp}. It will expire in 5 minutes.`
  });
}

exports.sendEmailOTP = async (req, res) => { 
    const { email} = req.body;
    
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  try {
    const otp = generateOTP();
    const token = generateToken();
     
    let otpDoc = await OTP.findOne({ email });

    if (otpDoc) {
        // Update existing document
        otpDoc.otp = otp;
        otpDoc.token = token;
        await otpDoc.save();
    } else {
        // Create new document
        otpDoc = await OTP.create({ email, otp, token });
    }
    await sendOTPEmail(email, otp);
    res.json({ success: true, message: 'OTP sent successfully', token });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
};


//OTP verifier
exports.verifyEmailOTP = async (req, res) => {
  const { otp, token,userId } = req.body;

  if (!otp || !token) {
    return res.status(400).json({ success: false, message: 'OTP and token are required' });
  }

  try {
    const otpDoc = await OTP.findOne({ token });
    if (!otpDoc) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    if (otp !== otpDoc.otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    const user=await User.findById(userId)
    user.isEmailVerified=true;
    await user.save();
    await OTP.deleteOne({ _id: otpDoc._id });

    res.json({ success: true, message: 'Email verified successfully', email: otpDoc.email });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ success: false, message: 'Failed to verify OTP' });
  }
};