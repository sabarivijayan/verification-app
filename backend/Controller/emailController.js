const OTP = require('../Models/otp.model'); // Import OTP model from Models directory
const User = require('../Models/user.model'); // Import User model from Models directory
const crypto = require('crypto'); // Import crypto module for generating random tokens
const nodemailer = require('nodemailer'); // Import nodemailer for sending emails

// Email transporter setup using nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail', // Email service provider
  auth: { // Authentication details for the email account
    user: process.env.EMAIL_USER, // Email address from environment variables
    pass: process.env.EMAIL_PASS  // Email password from environment variables
  }
});

// Function to generate a 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // Generates a random 6-digit number
}

// Function to generate a random 32-byte token using crypto module
function generateToken() {
  return crypto.randomBytes(32).toString('hex'); // Generates a random 32-byte hexadecimal string
}

// Function to send OTP email using nodemailer
async function sendOTPEmail(email, otp) {
  await transporter.sendMail({
    from: `"mern user panel" <${process.env.EMAIL_USER}>`, // Sender's email
    to: email, // Recipient's email
    subject: 'Your OTP for Email Verification', // Subject line of the email
    text: `Your OTP is: ${otp}. It will expire in 5 minutes.` // Body text of the email
  });
}

// Function to handle sending email OTP (exported to be used as an API endpoint)
exports.sendEmailOTP = async (req, res) => { 
  const { email } = req.body; // Extract email from request body
    
  if (!email) { // Check if email is provided
    return res.status(400).json({ success: false, message: 'Email is required' }); // Return error if email is missing
  }

  try {
    const otp = generateOTP(); // Generate a new OTP
    const token = generateToken(); // Generate a new token
     
    let otpDoc = await OTP.findOne({ email }); // Find existing OTP document for the email

    if (otpDoc) { // If OTP document exists, update it
        otpDoc.otp = otp; // Update OTP
        otpDoc.token = token; // Update token
        await otpDoc.save(); // Save updated OTP document
    } else { // If OTP document does not exist, create a new one
        otpDoc = await OTP.create({ email, otp, token }); // Create and save new OTP document
    }
    
    await sendOTPEmail(email, otp); // Send the OTP email to the user
    res.json({ success: true, message: 'OTP sent successfully', token }); // Respond with success and the token
  } catch (error) { // Handle any errors during the process
    console.error('Error sending OTP:', error); // Log the error
    res.status(500).json({ success: false, message: 'Failed to send OTP' }); // Respond with failure
  }
};

// Function to handle verifying email OTP (exported to be used as an API endpoint)
exports.verifyEmailOTP = async (req, res) => {
  const { otp, token, userId } = req.body; // Extract OTP, token, and user ID from request body

  if (!otp || !token) { // Check if OTP and token are provided
    return res.status(400).json({ success: false, message: 'OTP and token are required' }); // Return error if missing
  }

  try {
    const otpDoc = await OTP.findOne({ token }); // Find OTP document by token
    if (!otpDoc) { // If OTP document does not exist, return error
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    if (otp !== otpDoc.otp) { // Check if provided OTP matches the one in the document
      return res.status(400).json({ success: false, message: 'Invalid OTP' }); // Return error if OTP does not match
    }

    const user = await User.findById(userId); // Find user by ID
    user.isEmailVerified = true; // Set user's email verification status to true
    await user.save(); // Save updated user document
    await OTP.deleteOne({ _id: otpDoc._id }); // Delete OTP document after successful verification

    res.json({ success: true, message: 'Email verified successfully', email: otpDoc.email }); // Respond with success
  } catch (error) { // Handle any errors during the process
    console.error('Error verifying OTP:', error); // Log the error
    res.status(500).json({ success: false, message: 'Failed to verify OTP' }); // Respond with failure
  }
};
