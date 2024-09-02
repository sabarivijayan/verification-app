"use client"; // Indicates that this component is client-side in Next.js

import styles from "./verifyEmail.module.css"; // Importing CSS module for styling
import { useState, ChangeEvent } from "react"; // Importing React hooks and types
import OtpInput from "react-otp-input"; // OTP input component for handling OTP input fields
import ClipLoader from "react-spinners/ClipLoader"; // Loader component for showing loading state
import axios from "axios"; // HTTP client for making API requests
import { toast, Toaster } from "react-hot-toast"; // Notification library for displaying toast messages
import { useRouter } from "next/navigation"; // Router hook for client-side navigation in Next.js

// Functional component for email registration and OTP verification
const EmailVerification: React.FC = () => {
  // State variables with TypeScript type annotations
  const [email, setEmail] = useState<string>(""); // State for storing the user's email
  const [otp, setOtp] = useState<string>(""); // State for storing the OTP entered by the user
  const [showOTP, setShowOTP] = useState<boolean>(false); // State to control whether to show the OTP input fields
  const [loading, setLoading] = useState<boolean>(false); // State to control the loading spinner visibility
  const [emailError, setEmailError] = useState<string>(""); // State for displaying email validation error messages
  const [token, setToken] = useState<string | null>(null); // State for storing the token received after sending OTP
  const [isVerified, setIsVerified] = useState<boolean>(false); // State to track if the OTP has been successfully verified
  const router = useRouter(); // Next.js router instance for programmatic navigation

  // Function to validate the email format using a regular expression
  const validateEmail = (email: string): boolean => {
    const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/; // Regular expression for validating email format
    return re.test(email); // Returns true if the email matches the regex, otherwise false
  };

  // Event handler for changes in the email input field
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value; // Get the new email value from the input field
    setEmail(newEmail); // Update the email state with the new value
    setEmailError(""); // Clear any existing email error messages
  };

  // Function to send an OTP to the user's email
  const sendEmailOtp = async () => {
    if (!validateEmail(email)) { // Check if the email is valid
      setEmailError("Please enter a valid email address"); // Set error message if email is invalid
      return;
    }

    setLoading(true); // Show the loading spinner
    try {
      // Send a POST request to the server to send an OTP to the user's email
      const response = await axios.post(
        "http://localhost:5000/api/users/send-email-otp",
        { email }
      );

      if (response.data.success) { // If the response indicates success
        setShowOTP(true); // Show the OTP input fields
        setToken(response.data.token); // Store the received token
        localStorage.setItem("token", response.data.token); // Save the token in local storage
        toast.success("OTP sent successfully"); // Show a success toast message
      } else {
        setEmailError("Failed to send OTP. Please try again."); // Set error message if OTP sending fails
      }
    } catch (error) {
      console.error("Error sending OTP:", error); // Log the error for debugging
      setEmailError("An error occurred. Please try again later."); // Show a generic error message
    } finally {
      setLoading(false); // Hide the loading spinner
    }
  };

  // Function to verify the OTP entered by the user
  const onOTPVerify = async () => {
    if (!token) { // Check if there is a valid token
      setEmailError("Session expired. Please request a new OTP."); // Show error if no token is found
      toast.error("Session expired. Please request a new OTP."); // Show an error toast message
      return;
    }

    setLoading(true); // Show the loading spinner
    try {
      const userId = localStorage.getItem("userId"); // Retrieve the user ID from local storage
      // Send a POST request to verify the OTP with the server
      const response = await axios.post(
        "http://localhost:5000/api/users/verify-email-otp",
        {
          otp,
          token,
          userId,
        }
      );

      if (response.data.success) { // If OTP verification is successful
        localStorage.removeItem("token"); // Remove the token from local storage
        setIsVerified(true); // Update the verification state to true
        toast.success("OTP verified successfully"); // Show a success toast message
        setTimeout(() => {
          router.push("/Verification/aadhar"); // Redirect the user to another page after successful verification
        }, 1200);
      } else {
        setEmailError(
          response.data.message || "Invalid OTP. Please try again."
        ); // Show error message if OTP verification fails
        toast.error(response.data.message || "Invalid OTP. Please try again."); // Show an error toast message
      }
    } catch (error) {
      // Handle errors related to Axios requests
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // If the server responded with an error status
          toast.error(
            error.response.data.message || "Invalid OTP. Please try again."
          );
        } else if (error.request) {
          // If the request was made but no response was received
          toast.error("No response from server. Please try again.");
        } else {
          // If an error occurred while setting up the request
          toast.error("An error occurred. Please try again later.");
        }
      } else {
        // Handle non-Axios errors
        toast.error("An unexpected error occurred. Please try again later.");
      }
      console.error("Error verifying OTP:", error); // Log the error for debugging
    } finally {
      setLoading(false); // Hide the loading spinner
    }
  };

  return (
    <div className={styles.wrapper}>
      {/* Toast notifications */}
      <Toaster toastOptions={{ duration: 1200 }} />
      
      {/* Form container */}
      <div className={styles.formContainer}>
        <h1 className={styles.title}>Email verification</h1>
        
        {/* Conditional rendering to show OTP input fields or email input field */}
        {showOTP ? (
          <>
            {/* OTP input fields */}
            <label htmlFor="otp" className={styles.label}>
              Enter your OTP
            </label>
            <div className={styles.otpContainer}>
              <OtpInput
                value={otp}
                onChange={setOtp}
                numInputs={6}
                renderSeparator={<span> </span>}
                shouldAutoFocus={true}
                inputStyle={styles.otpInput}
                renderInput={(props) => (
                  <input
                    {...props}
                    className={styles.otpInputField} // Class for OTP input field styling
                  />
                )}
              />
            </div>

            {/* OTP verification button */}
            <div className={styles.buttonContainer}>
              <button
                onClick={onOTPVerify}
                className={styles.button}
                disabled={loading || isVerified}
              >
                {loading ? (
                  <ClipLoader
                    color={"#ffffff"}
                    loading={loading}
                    size={20}
                    aria-label="Loading Spinner"
                    data-testid="loader"
                  />
                ) : isVerified ? (
                  <span>Verified</span>
                ) : (
                  <span>Verify OTP</span>
                )}
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Email input field */}
            <label className={styles.label}>Enter your email</label>
            <div className={styles.inputContainer}>
              <input
                type="email"
                placeholder="email"
                name="email"
                required
                value={email}
                onChange={handleChange}
                disabled={loading}
                className={styles.inputField} // Class for email input field styling
              />
            </div>

            {/* Error message display for invalid email */}
            {emailError && (
              <p className={styles.errorMessage}>{emailError}</p>
            )}

            {/* Send OTP button */}
            <div className={styles.buttonContainer}>
              <button
                onClick={sendEmailOtp}
                className={styles.button}
                disabled={loading}
              >
                {loading ? (
                  <>
                    sending otp{" "}
                    <ClipLoader
                      color={"#ffffff"}
                      loading={loading}
                      size={20}
                      aria-label="Loading Spinner"
                      data-testid="loader"
                    />
                  </>
                ) : (
                  <span>Send code via Email</span>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EmailVerification; // Exporting the component for use in other parts of the application
