const User = require("../Models/user.model");

// Register a new user
const registerUser = async (req, res) => {
  try {
    const { name, email, phone, dob, aadhar } = req.body;

    //Create a new user
    const newUser = new User({
      name,
      email,
      phone,
      dob,
      aadhar,
    });
    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
      user: newUser._id,
    });
  } catch (err) {
    // Handle specific Mongoose errors
    if (err.name === "ValidationError") {
      return res
        .status(400)
        .json({ message: "Validation Error", error: err.message });
    }

    if (err.code === 11000) {
      // Duplicate key error code
      return res
        .status(409)
        .json({ message: "Duplicate Key Error", error: err.message });
    }

    // Handle any other errors
    res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
  }
};
const updateUser = async (req, res) => {
  try {
      const { userId, field, value } = req.body;
      console.log(userId,field,value)
      const updateData = {
          [field]: value,
          [`is${
              field.charAt(0).toUpperCase() + field.slice(1)
          }Verified`]: true,
      };
      const user = await User.findByIdAndUpdate(userId, updateData, {
          new: true,
      });
      if (!user) {
          return res.status(404).json({ message: "user not found" });
      }
      res.json({ message: "User updated successfully ", user });
  } catch (err) {
      res.status(400).json({ message: "update failed", error: err.message });
  }
};

module.exports = { registerUser, updateUser };
