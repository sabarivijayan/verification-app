"use client";
import React, { useState } from "react";
import { BsFillShieldLockFill, BsTelephoneFill } from "react-icons/bs";
import OtpInput from "react-otp-input";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { RecaptchaVerifier, signInWithPhoneNumber, User,} from "firebase/auth";
import { toast, Toaster } from "react-hot-toast";
import styles from "./phoneVerification.module.css";
import axios from "axios";
import ClipLoader from "react-spinners/ClipLoader";
import { useRouter } from "next/navigation";

// Import your Firebase config
import { auth } from "@/utils/firebase";

const PhoneVerification: React.FC = () => {
  const [otp, setOtp] = useState<string>("");
  const [ph, setPh] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showOTP, setShowOTP] = useState<boolean>(false);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const router = useRouter();

  function onCaptchaVerify() {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
          callback: (response: any) => {},
          "expired-callback": () => {
            console.log("reCAPTCHA expired");
            toast.error("reCAPTCHA expired. Please try again.");
          },
        }
      );
    }
  }

  async function onSignup() {
    if (loading) return; // Prevent multiple calls if already loading

    setLoading(true);
    try {
      onCaptchaVerify(); // Ensure reCAPTCHA is set up
      const appVerifier = (window as any).recaptchaVerifier;
      const formatPh = "+" + ph;

      const confirmationResult = await signInWithPhoneNumber(
        auth,
        formatPh,
        appVerifier
      );
      (window as any).confirmationResult = confirmationResult;
      setShowOTP(true);
      toast.success("OTP sent successfully!");
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast.error("Failed to send OTP. Please try again.");
      // Reset reCAPTCHA on error
      if ((window as any).recaptchaVerifier) {
        (window as any).recaptchaVerifier.clear();
        (window as any).recaptchaVerifier = null;
      }
    } finally {
      setLoading(false);
    }
  }

  function onOTPVerify() {
    setLoading(true);
    (window as any).confirmationResult
      .confirm(otp)
      .then(async (res: { user: User }) => {
        const userId = localStorage.getItem("userId");
        setLoading(false);
        setIsVerified(true);

        await axios.put("http://localhost:5000/api/users/update", {
          userId,
          field: "phone",
          value: ph,
        });
        toast.success("Otp verified successfully");
        setTimeout(() => {
          router.push("/Verification/email");
        }, 1300);
      })
      .catch((err: Error) => {
        console.log(err);
        setLoading(false);
        toast.error("invalid otp");
      });
  }

  return (
    <section className={styles.container}>
      <div>
        <Toaster toastOptions={{ duration: 1300 }} />
        <div id="recaptcha-container"></div>

        <div className={styles.formContainer}>
          <h1 className={styles.title}>Mobile verfication</h1>
          {showOTP ? (
            <>
              <div className={styles.iconContainer}>
                <BsFillShieldLockFill size={30} />
              </div>
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
                  inputStyle={styles.OtpContainer}
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
                    />
                  )}
                />
              </div>
              <div className={styles.buttonContainer}>
                <button
                  onClick={onOTPVerify}
                  className={styles.button}
                  disabled={loading || isVerified}
                >
                  {loading ? (
                    <>
                      verifying
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
              <div className={styles.iconContainer}>
                <BsTelephoneFill size={60} />
              </div>
              <label className={styles.label}>Verify your phone number</label>
              <PhoneInput
                country={"in"}
                value={ph}
                onChange={(phone: string) => setPh(phone)}
                disabled={loading}
              />
              <div className={styles.buttonContainer}>
                <button
                  onClick={onSignup}
                  className={styles.button}
                  disabled={loading}
                >
                  {loading && (
                    <ClipLoader
                      color={"#ffffff"}
                      loading={loading}
                      size={20}
                      aria-label="Loading Spinner"
                      data-testid="loader"
                    />
                  )}
                  <span>Send code via SMS</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default PhoneVerification;
