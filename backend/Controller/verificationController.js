const axios = require('axios');
const User = require('../Models/user.model');
const moment = require('moment');

// Aadhar OTP
exports.aadharOTP = async (req, res) => {
    const { aadharNumber } = req.body;
    try {
        const response = await axios.post(`https://api.sandbox.co.in/kyc/aadhaar/okyc/otp`, {
            ['@entity']: "in.co.sandbox.kyc.aadhaar.okyc.otp.request",
            aadharNumber,
            consent: 'y',
            reason: "Verification for user registration and KYC compliance"
        }, {
            headers: {
                'Authorization': req.sandboxAccessToken,
                'x-api-key': process.env.SANDBOX_API_KEY,
                'x-api-version': '1.0',
                'Content-Type': 'application/json',
            }
        });
        if (response.data.code === 200 && response.data.data.ref_id) {
            return res.json({
                success: true,
                ref_id: response.data.data.ref_id,
                message: 'Aadhar verification has been initiated. OTP sent successfully',
            });
        }
        if (response.data.code === 200 && !response.data.data.ref_id) {
            return res.json({
                success: false,
                message: 'Aadhar verification has failed',
            });
        }
    } catch (error) {
        console.error('Error sending OTP for Aadhar: ', error.response?.data || error.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to send OTP for Aadhar verification',
        });
    }
};

// Aadhar Verify
exports.aadharVerify = async (req, res) => {
    const { referenceId, otp, userId } = req.body;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }
        const response = await axios.post(`https://api.sandbox.co.in/kyc/aadhaar/okyc/otp/verify`, {
            ['@entity']: "in.co.sandbox.kyc.aadhaar.okyc.verify.request",
            referenceId,
            otp,
        }, {
            headers: {
                'Authorization': req.sandboxAccessToken,
                'x-api-key': process.env.SANDBOX_API_KEY,
                'x-api-version': '2.0',
                'Content-Type': 'application/json',
            }
        });
        if (response.data.code === 200 && response.data.data.status === 'VALID') {
            user.isAadharVerified = true;
            await user.save();
            return res.json({
                success: true,
                data: response.data.data,
            });
        } else {
            return res.json({
                success: false,
                data: response.data.data
            });
        }
    } catch (error) {
        console.error('Error verifying Aadhar OTP: ', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: error?.response?.data?.data,
        });
    }
};

// PAN Verify
exports.panVerify = async (req, res) => {
    const { pan, userId } = req.body;

    if (!pan || !userId) {
        return res.status(400).json({ message: "Please enter pan and userId" });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const dobFormat = moment(user.dob).format('DD/MM/YYYY');
        const capitalName = user.name.toUpperCase();

        const sandboxRequestBody = {
            ["@entity"]: "in.co.sandbox.kyc.pan_verification.request",
            pan,
            date_of_birth: dobFormat,
            name_as_per_pan: capitalName,
            consent: "y",
            reason: "Verification for user registration and KYC compliance"
        };

        const sandboxResponse = await axios.post('https://api.sandbox.co.in/kyc/pan/verify', sandboxRequestBody, {
            headers: {
                'Authorization': req.sandboxAccessToken,
                'x-api-key': process.env.SANDBOX_API_KEY,
                'x-api-version': '1',
                'Content-Type': 'application/json'
            }
        });

        if (sandboxResponse.data.code === 200 && sandboxResponse.data.data.status === 'valid') {
            user.pan = pan;
            user.isPanVerified = true;
            await user.save();

            res.json({
                success: true,
                message: "Pan verification successful",
                data: {
                    pan: sandboxResponse.data.data.pan,
                    name_as_per_pan_match: sandboxResponse.data.data.name_as_per_pan_match,
                    dob_as_per_pan_match: sandboxResponse.data.data.date_of_birth_match,
                    category: sandboxResponse.data.data.category,
                    aadharSeedingStatus: sandboxResponse.data.data.aadhaar_seeding_status
                }
            });
        } else {
            res.json({
                success: false,
                message: "Pan verification failed",
                data: sandboxResponse.data.data
            });
        }
    } catch (error) {
        console.error('Error while verifying PAN Card: ', error.response ? error.response.data : error.message);
        if (error.response) {
            res.status(error.response.status).json({
                success: false,
                message: 'PAN verification failed. Try again!',
                error: error.response.data
            });
        } else if (error.request) {
            res.status(500).json({
                success: false,
                message: 'No response from server',
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'An error has occurred in verification',
            });
        }
    }
};

// Bank Verify
exports.bankVerify = async (req, res) => {
    const { accNo, ifsc, userId } = req.body;

    if (!accNo || !ifsc || !userId) {
        return res.status(400).json({
            success: false,
            message: "Please enter your Account number, IFSC and user ID.",
        });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const queryParams = new URLSearchParams({
            name: user.name,
            mobile: user.phone
        }).toString();

        const apiUrl = `https://api.sandbox.co.in/bank/${ifsc}/accounts/${accNo}/verify?${queryParams}`;
        const sandboxResponse = await axios.get(apiUrl, {
            headers: {
                'Authorization': req.sandboxAccessToken,
                'x-api-key': process.env.SANDBOX_API_KEY,
                'x-api-version': '2',
                'Content-Type': 'application/json',
            }
        });

        if (sandboxResponse.data.code === 200 && sandboxResponse.data.data.account_exists) {
            user.bankAccount = accNo;
            user.ifsc = ifsc;
            user.isBankAccountVerified = true;
            await user.save();

            res.json({
                success: true,
                message: 'Bank account verified successfully',
                data: sandboxResponse.data
            });
        } else if (sandboxResponse.data.code === 200 && !sandboxResponse.data.data.account_exists) {
            res.json({
                success: false,
                message: 'Account does not exist',
                data: sandboxResponse.data
            });
        }
    } catch (error) {
        console.error('Error in verifying the bank account: ', error.response ? error.response.data : error.message);
        if (error.response) {
            return res.status(error.response.status).json({
                success: false,
                message: 'Bank account verification has failed',
                error: error.response.data,
            });
        } else if (error.request) {
            return res.status(500).json({
                success: false,
                message: 'Bank account verification has failed because no response from server',
            });
        } else {
            return res.status(500).json({
                success: false,
                message: 'Bank account verification has failed due to an error',
            });
        }
    }
};

// GST Verify
// GST Verify
exports.gstVerify = async (req, res) => {
  const { gstin, userId } = req.body;

  if (!gstin || !userId) {
      return res.status(400).json({ message: "Please enter GSTIN and userId" });
  }

  try {
      const user = await User.findById(userId);
      if (!user) {
          return res.status(404).json({ message: "User not found" });
      }

      const sandboxRequestBody = {
          ["@entity"]: "in.co.sandbox.kyc.gst_verification.request",
          gstin,
          consent: "y",
          reason: "Verification for user registration and KYC compliance"
      };

      const sandboxResponse = await axios.post('https://api.sandbox.co.in/kyc/gst/verify', sandboxRequestBody, {
          headers: {
              'Authorization': req.sandboxAccessToken,
              'x-api-key': process.env.SANDBOX_API_KEY,
              'x-api-version': '1',
              'Content-Type': 'application/json'
          }
      });

      if (sandboxResponse.data.code === 200 && sandboxResponse.data.data.status === 'valid') {
          user.gstin = gstin;
          user.isGstVerified = true;
          await user.save();

          res.json({
              success: true,
              message: "GST verification successful",
              data: sandboxResponse.data.data
          });
      } else {
          res.json({
              success: false,
              message: "GST verification failed",
              data: sandboxResponse.data.data
          });
      }
  } catch (error) {
      console.error('Error while verifying GST: ', error.response ? error.response.data : error.message);
      if (error.response) {
          res.status(error.response.status).json({
              success: false,
              message: 'GST verification failed. Try again!',
              error: error.response.data
          });
      } else if (error.request) {
          res.status(500).json({
              success: false,
              message: 'No response from server',
          });
      } else {
          res.status(500).json({
              success: false,
              message: 'An error occurred during GST verification',
          });
      }
  }
};
