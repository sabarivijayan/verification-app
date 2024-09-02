"use client"; // Indicates this is a client-side component in Next.js

import React, { useState } from "react"; // Import React and hooks
import { BsFillShieldLockFill, BsTelephoneFill } from "react-icons/bs"; // Import icons
import OtpInput from "react-otp-input"; // Import OTP input component
import PhoneInput from "react-phone-input-2"; // Import phone input component
import "react-phone-input-2/lib/style.css"; // Import styles for phone input
import { RecaptchaVerifier, signInWithPhoneNumber, User } from "firebase/auth"; // Import Firebase authentication functions
import { toast, Toaster } from "react-hot-toast"; // Import toast notifications
import styles from "./phoneVerification.module.css"; // Import CSS module for styling
import axios from "axios"; // Import axios for HTTP requests
import ClipLoader from "react-spinners/ClipLoader"; // Import spinner for loading states
import { useRouter } from "next/navigation"; // Import router for navigation

// Import Firebase configuration
import { auth } from "@/utils/firebase";

// Functional component for phone verification
const PhoneVerification: React.FC = () => {
  // State to manage OTP input
  const [otp, setOtp] = useState<string>("");
  
  // State to manage phone number input
  const [ph, setPh] = useState<string>("");
  
  // State to manage loading spinner
  const [loading, setLoading] = useState<boolean>(false);
  
  // State to determine if the OTP input should be shown
  const [showOTP, setShowOTP] = useState<boolean>(false);
  
  // State to determine if the phone number has been verified
  const [isVerified, setIsVerified] = useState<boolean>(false);
  
  // Router hook for navigation
  const router = useRouter();

  // Function to set up reCAPTCHA verifier
  function onCaptchaVerify() {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(
        auth, // Firebase auth instance
        "recaptcha-container", // HTML element ID for reCAPTCHA
        {
          size: "invisible", // Invisible reCAPTCHA
          callback: (response: any) => {}, // Callback function when reCAPTCHA is solved
          "expired-callback": () => {
            console.log("reCAPTCHA expired");
            toast.error("reCAPTCHA expired. Please try again.");
          },
        }
      );
    }
  }

  // Function to handle sending OTP
  async function onSignup() {
    if (loading) return; // Prevent multiple requests if already loading

    setLoading(true); // Set loading state
    try {
      onCaptchaVerify(); // Initialize reCAPTCHA
      const appVerifier = (window as any).recaptchaVerifier; // Get reCAPTCHA verifier
      const formatPh = "+" + ph; // Format phone number with country code

      // Firebase function to send OTP to the phone number
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        formatPh,
        appVerifier
      );
      (window as any).confirmationResult = confirmationResult; // Store the confirmation result globally
      setShowOTP(true); // Show OTP input field
      toast.success("OTP sent successfully!"); // Show success toast
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast.error("Failed to send OTP. Please try again."); // Show error toast
      // Reset reCAPTCHA on error
      if ((window as any).recaptchaVerifier) {
        (window as any).recaptchaVerifier.clear();
        (window as any).recaptchaVerifier = null;
      }
    } finally {
      setLoading(false); // Reset loading state
    }
  }

  // Function to handle OTP verification
  function onOTPVerify() {
    setLoading(true); // Set loading state
    (window as any).confirmationResult
      .confirm(otp) // Confirm OTP with Firebase
      .then(async (res: { user: User }) => {
        const userId = localStorage.getItem("userId"); // Get user ID from local storage
        setLoading(false); // Reset loading state
        setIsVerified(true); // Set verified state to true

        // Update the user's phone number in the database
        await axios.put("http://localhost:5000/api/users/update", {
          userId,
          field: "phone",
          value: ph,
        });
        toast.success("OTP verified successfully"); // Show success toast
        // Navigate to the email verification page after a delay
        setTimeout(() => {
          router.push("/Verification/email");
        }, 1300);
      })
      .catch((err: Error) => {
        console.log(err);
        setLoading(false); // Reset loading state
        toast.error("Invalid OTP"); // Show error toast
      });
  }

  return (
    <section className={styles.container}>
      <div>
        <Toaster toastOptions={{ duration: 1300 }} /> {/* Toast notification container */}
        <div id="recaptcha-container"></div> {/* Container for reCAPTCHA */}

        <div className={styles.formContainer}>
          <h1 className={styles.title}>Mobile Verification</h1> {/* Title of the form */}
          {showOTP ? ( // Conditional rendering for OTP input
            <>
              <div className={styles.iconContainer}>
                <BsFillShieldLockFill size={30} /> {/* Shield icon for OTP input */}
              </div>
              <label htmlFor="otp" className={styles.label}>
                Enter your OTP
              </label> {/* Label for OTP input */}
              <div className={styles.otpContainer}>
                <OtpInput
                  value={otp} // Bind OTP input value to state
                  onChange={setOtp} // Update state on OTP input change
                  numInputs={6} // Number of OTP input fields
                  renderSeparator={<span> </span>} // Separator between OTP input fields
                  shouldAutoFocus={true} // Automatically focus on OTP input
                  inputStyle={styles.OtpContainer} // Custom styling for OTP input
                  renderInput={(props) => (
                    <input
                      {...props}
                      style={{
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        padding: "10px",
                        fontSize: "16px",
                        width: "20px",
                        textAlign: "center",
                        marginRight: "5px",
                        display: "flex",
                        justifyContent: "center",
                      }}
                    /> // Custom OTP input field
                  )}
                />
              </div>
              <div className={styles.buttonContainer}>
                <button
                  onClick={onOTPVerify} // Click handler for OTP verification
                  className={styles.button}
                  disabled={loading || isVerified} // Disable button during loading or if already verified
                >
                  {loading ? ( // Conditional rendering based on loading state
                    <>
                      Verifying
                      <ClipLoader
                        color={"#ffffff"}
                        loading={loading}
                        size={20}
                        aria-label="Loading Spinner"
                        data-testid="loader"
                      />
                    </>
                  ) : isVerified ? (
                    <span>Verified</span> // Show verified state
                  ) : (
                    <span>Verify OTP</span> // Default button text for verification
                  )}
                </button>
              </div>
            </>
          ) : ( // Render phone number input if OTP input is not shown
            <>
              <div className={styles.iconContainer}>
                <BsTelephoneFill size={60} /> {/* Telephone icon for phone input */}
              </div>
              <label className={styles.label}>Verify your phone number</label> {/* Label for phone input */}
              <PhoneInput
                country={"in"} // Default country for phone input
                value={ph} // Bind phone input value to state
                onChange={(phone: string) => setPh(phone)} // Update state on phone input change
                disabled={loading} // Disable input during loading state
              />
              <div className={styles.buttonContainer}>
                <button
                  onClick={onSignup} // Click handler to send OTP
                  className={styles.button}
                  disabled={loading} // Disable button during loading
                >
                  {loading && ( // Show spinner during loading
                    <ClipLoader
                      color={"#ffffff"}
                      loading={loading}
                      size={20}
                      aria-label="Loading Spinner"
                      data-testid="loader"
                    />
                  )}
                  <span>Send code via SMS</span> {/* Button text */}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default PhoneVerification; // Export the component for use in other parts of the application
