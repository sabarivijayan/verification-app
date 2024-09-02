"use client";
import React, { useState, ChangeEvent, useEffect } from "react";
import { useRouter } from "next/router";
import { toast, Toaster } from "react-hot-toast";
import axios from "axios";
import OtpInput from "react-otp-input";
import ClipLoader from "react-spinners/ClipLoader";
import styles from "./verifyAadhar.module.css";

const VerifyAadhar: React.FC = () => {
  const [otp, setOtp] = useState<string>("");
  const [otpError, setOtpError] = useState<string>("");
  const [showOTP, setShowOTP] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [aadharNumber, setAadharNumber] = useState<string>("");
  const [aadharError, setAadharError] = useState<string>("");
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [referenceId, setReferenceId] = useState<string | null>("");

  const router = useRouter();

  useEffect(() => {
    return () => {
      sessionStorage.removeItem("aadharReferenceId");
    };
  }, []);

  const validateAadhar = (aadhar: string): boolean => {
    const regex = /^[0-9]{12}$/; // Regex to check if Aadhar is exactly 12 digits
    return regex.test(aadhar);
  };

  // Function to handle changes in the Aadhar input field
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newAadharData = e.target.value;
    setAadharNumber(newAadharData);
    setAadharError(""); // Clear any existing error messages when user modifies input
  };

  // Function to send the OTP to the user's Aadhar linked phone number
  const sendAadharOtp = async () => {
    // Validate the Aadhar number before sending OTP
    if (!validateAadhar(aadharNumber)) {
      setAadharError("Please enter a valid 12-digit Aadhar number");
      return;
    }

    try {
      setLoading(true); // Set loading state to true while sending OTP
      sessionStorage.removeItem("aadhaarReferenceId"); // Remove any existing reference ID in session storage
      setReferenceId(null);
      const response = await axios.post(
        "http://localhost:5000/api/users/send-aadhar-otp",
        { aadharNumber }
      );
      // If the API call is successful, store the reference ID and show the OTP input field
      if (response.data.success) {
        const newReferenceId = response.data.ref_id;
        setReferenceId(newReferenceId);
        sessionStorage.setItem("aadhaarReferenceId", newReferenceId);
        toast.success("OTP sent successfully");
        setShowOTP(true); // Show the OTP input field
      } else {
        toast.error(response.data.message); // Show error message if the API call fails
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast.error("An error occurred. Please try again later."); // Show error message for any exceptions
    } finally {
      setLoading(false); // Set loading state to false after the API call
    }
  };

  // Function to verify the OTP entered by the user
  const onOTPVerify = async () => {
    // Ensure the OTP field is not empty before verifying
    if (!otp) {
      setOtpError("OTP field can't be empty");
      return;
    }
    setLoading(true); // Set loading state to true while verifying OTP
    const userId = localStorage.getItem("userId"); // Retrieve user ID from local storage
    const storedReferenceId =
      sessionStorage.getItem("aadhaarReferenceId") || referenceId; // Get the reference ID from session storage or state
    try {
      const response = await axios.post(
        "http://localhost:5000/api/users/verify-aadhar-otp",
        {
          otp,
          referenceId: storedReferenceId,
          userId,
        }
      );
      // If the OTP is successfully verified, update the state and redirect to the next step
      if (response.data.success) {
        setIsVerified(true);
        toast.success("Aadhar verified successfully");
        sessionStorage.removeItem("aadhaarReferenceId");
        setTimeout(() => {
          router.push("/register/pancard"); // Redirect to PAN card verification page after a delay
        }, 1200);
      } else {
        toast.error(response.data.data.message || "Invalid OTP, try again"); // Show error message if OTP verification fails
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.response.data.message || "Some error occurred"); // Show error message for any exceptions
    } finally {
      setLoading(false); // Set loading state to false after the API call
    }
  };

  // Render the Aadhar verification form
  return (
    <div className={styles.aadharWrapper}>
      <Toaster toastOptions={{ duration: 1200 }} />
      <div className={styles.aadharFormContainer}>
        <h1 className={styles.aadharTitle}>Aadhar Verification</h1>
        {showOTP ? (
          <>
            <label htmlFor="otp" className={styles.aadharLabel}>
              Enter your OTP
            </label>
            <div className={styles.otpWrapper}>
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
                    disabled={isVerified} // Disable the input if already verified
                    className={styles.otpInputElement}
                  />
                )}
              />
            </div>
            {otpError && (
              <div className={styles.aadharErrorMessage}>{otpError}</div>
            )}

            <div className={styles.buttonWrapper}>
              <button
                onClick={onOTPVerify}
                disabled={loading || isVerified} // Disable the button while loading or if already verified
                className={styles.aadharButton}
              >
                {loading ? (
                  <>
                    Verifying{" "}
                    <ClipLoader
                      color={"#ffffff"}
                      loading={loading}
                      size={20}
                      aria-label="Loading Spinner"
                      data-testid="loader"
                    />
                  </>
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
            <label className={styles.aadharLabel}>
              Enter your Aadhar Number
            </label>
            <div className={styles.aadharInputWrapper}>
              <input
                type="text"
                placeholder="Aadhar Number"
                name="aadharNumber"
                required
                value={aadharNumber}
                onChange={handleChange}
                disabled={loading} // Disable the input while loading
                maxLength={12}
                className={styles.aadharInput}
              />
            </div>
            {aadharError && (
              <div className={styles.aadharErrorMessage}>{aadharError}</div>
            )}
            <div className={styles.buttonWrapper}>
              <button
                onClick={sendAadharOtp}
                className={styles.aadharButton}
                disabled={loading} // Disable the button while loading
              >
                {loading ? (
                  <>
                    Sending OTP{" "}
                    <ClipLoader
                      color={"#ffffff"}
                      loading={loading}
                      size={20}
                      aria-label="Loading Spinner"
                      data-testid="loader"
                    />
                  </>
                ) : (
                  <span>Send OTP</span>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Export the AadharVerification component as the default export
export default VerifyAadhar;