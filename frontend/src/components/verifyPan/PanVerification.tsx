"use client";
import React from "react";
import styles from "./panVerification.module.css";
import ClipLoader from "react-spinners/ClipLoader";
import axios from "axios";
import { useState, ChangeEvent } from "react";
import { toast, Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";

const PanVerification: React.FC = () => {
    const [pan, setPan] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [isVerified, setIsVerified] = useState<boolean>(false);
    const router = useRouter();
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newPan = e.target.value;
        setPan(newPan);
        setError(""); // Clear error when user types
    };

    const verifyPan = async () => {
        if (!validatePan(pan)) {
            setError(
                "Invalid PAN format. It should be in the format ABCDE1234F"
            );
            return;
        }

        setLoading(true);
        try {
            const userId = localStorage.getItem("userId");
            const response = await axios.post(
                "http://localhost:5000/api/users/verify-pan",
                { pan, userId }
            );
            console.log(response.data);
            if (response.data.success) {
              setIsVerified(true)
                toast.success("PAN verified successfully");
                setTimeout(() => {
                    router.push("/Verification/gst");
                }, 1200);
            } else {
                toast.error(response.data.message || "Failed to verify PAN");
            }
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                toast.error(
                    error.response.data.message ||
                        "An error occurred while verifying PAN"
                );
            } else {
                toast.error("An unexpected error occurred");
            }
        } finally {
            setLoading(false);
        }
    };

    const validatePan = (pan: string): boolean => {
        const regex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        return regex.test(pan);
    };

    return (
        <div className={styles.wrapper}>
            <Toaster toastOptions={{ duration: 1200 }} />
            <div className={styles.formContainer}>
                <h1 className={styles.title}>Pan verfication</h1>
                <label className={styles.label}>
                    Enter your Pan Card number
                </label>
                <div className={styles.inputContainer}>
                    <input
                        type="text"
                        placeholder="Enter your pancard number"
                        name="pancard"
                        required
                        value={pan}
                        onChange={handleChange}
                        disabled={loading}
                    />
                </div>
                {error && <div className={styles.errorMessage}>{error}</div>}
                <div className={styles.buttonContainer}>
                <button
                        onClick={verifyPan}
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
                            <span>Verify PAN</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PanVerification;
