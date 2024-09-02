const User = require("../Models/user.model"); // Import the User model from the Models directory

// Function to register a new user
const registerUser = async (req, res) => {
  try {
    const { name, email, phone, dob, aadhar } = req.body; // Destructure the necessary fields from the request body

    // Create a new user instance with the provided details
    const newUser = new User({
      name,
      email,
      phone,
      dob,
      aadhar,
    });
    
    // Save the new user to the database
    await newUser.save();

    // Send a success response with the new user's ID
    res.status(201).json({
      message: "User registered successfully",
      user: newUser._id,
    });
  } catch (err) {
    // Handle specific Mongoose errors

    if (err.name === "ValidationError") {
      // If there's a validation error (e.g., missing required fields), respond with a 400 status
      return res
        .status(400)
        .json({ message: "Validation Error", error: err.message });
    }

    if (err.code === 11000) {
      // If there's a duplicate key error (e.g., duplicate email or phone), respond with a 409 status
      return res
        .status(409)
        .json({ message: "Duplicate Key Error", error: err.message });
    }

    // Handle any other errors with a 500 status (internal server error)
    res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

// Function to update user information
const updateUser = async (req, res) => {
  try {
    const { userId, field, value } = req.body; // Destructure the userId, field, and value from the request body
    console.log(userId, field, value); // Log the inputs for debugging purposes

    // Create an update object dynamically based on the field to be updated
    const updateData = {
      [field]: value, // Dynamically set the field to the new value
      [`is${field.charAt(0).toUpperCase() + field.slice(1)}Verified`]: true, // Dynamically set the verification status field based on the field being updated
    };

    // Find the user by ID and update the specified field(s)
    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true, // Return the updated document instead of the original
    });

    if (!user) {
      // If the user is not found, respond with a 404 status
      return res.status(404).json({ message: "User not found" });
    }

    // Send a success response with the updated user information
    res.json({ message: "User updated successfully", user });
  } catch (err) {
    // Handle any errors that occur during the update process
    res.status(400).json({ message: "Update failed", error: err.message });
  }
};

// Export the registerUser and updateUser functions for use in other parts of the application
module.exports = { registerUser, updateUser };
