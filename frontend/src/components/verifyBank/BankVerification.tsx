import React, { useState, ChangeEvent } from "react";
import styles from "./verifyBank.module.css"; // Importing the CSS module
import ClipLoader from "react-spinners/ClipLoader"; // Loading spinner component
import axios from "axios"; // For making HTTP requests
import { toast, Toaster } from "react-hot-toast"; // For showing toast notifications
import { useRouter } from "next/navigation"; // For navigating between pages

interface FormInput {
    ifsc: string; // IFSC code input
    accNo: string; // Account number input
}

interface FormError {
    ifsc: string; // Error for IFSC code
    accNo: string; // Error for account number
}

const BankVerification: React.FC = () => {
    // State to handle form input values
    const [formInput, setFormInput] = useState<FormInput>({
        ifsc: "",
        accNo: "",
    });

    // State to handle form validation errors
    const [error, setError] = useState<FormError>({
        ifsc: "",
        accNo: "",
    });

    // State to manage loading state for async operations
    const [loading, setLoading] = useState<boolean>(false);

    // State to track if the bank account is verified
    const [isVerified, setIsVerified] = useState<boolean>(false);

    const router = useRouter(); // Hook for navigation

    // Handle input change and reset error messages for the respective fields
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormInput((prev) => ({ ...prev, [name]: value }));
        setError((prev) => ({ ...prev, [name]: "" }));
    };

    // Function to verify the bank account
    const verifyAcc = async () => {
        // Validate account number
        if (!validateAccNo(formInput.accNo)) {
            setError((prev) => ({
                ...prev,
                accNo: "Account number must contain only numbers",
            }));
        }

        // Validate IFSC code
        if (!validateIfscCode(formInput.ifsc)) {
            setError((prev) => ({ ...prev, ifsc: "Invalid IFSC code" }));
            return;
        }

        setLoading(true); // Start loading

        try {
            const userId = localStorage.getItem("userId"); // Get user ID from local storage
            const response = await axios.post(
                "http://localhost:5000/api/users/verify-bank-account",
                { ...formInput, userId }
            );
            
            if (response.data.success) {
                setIsVerified(true); // Mark as verified
                toast.success("Bank account verified successfully");
                setTimeout(() => {
                    router.push("/AddressLookup"); // Redirect to the next step
                }, 1200);
            } else {
                toast.error(
                    response.data.message || "Failed to verify bank account"
                );
            }
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                toast.error(
                    error.response.data.message ||
                        "An error occurred while verifying bank account"
                );
            } else {
                toast.error("An unexpected error occurred");
            }
            console.error("Error verifying bank account:", error);
        } finally {
            setLoading(false); // Stop loading
        }
    };

    // Function to validate the account number
    const validateAccNo = (accNo: string): boolean => {
        return /^\d+$/.test(accNo);
    };

    // Function to validate the IFSC code
    const validateIfscCode = (ifsc: string): boolean => {
        return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc);
    };

    return (
        <div className={styles.wrapper}>
            <Toaster toastOptions={{ duration: 1200 }} /> {/* Toast notifications */}
            <div className={styles.formContainer}>
                <h1 className={styles.title}>Bank Account Verification</h1>
                <label className={styles.label}>Enter your IFSC code</label>
                <div className={styles.inputContainer}>
                    <input
                        type="text"
                        placeholder="Enter your IFSC code"
                        name="ifsc"
                        required
                        value={formInput.ifsc}
                        onChange={handleChange}
                    />
                </div>
                {error.ifsc && (
                    <div className={styles.errorMessage}>{error.ifsc}</div>
                )}
                <label className={styles.label}>
                    Enter your account number
                </label>
                <div className={styles.inputContainer}>
                    <input
                        type="text"
                        placeholder="Enter your account number"
                        name="accNo"
                        required
                        value={formInput.accNo}
                        onChange={handleChange}
                    />
                </div>
                {error.accNo && (
                    <div className={styles.errorMessage}>{error.accNo}</div>
                )}
                <div className={styles.buttonContainer}>
                    <button
                        onClick={verifyAcc}
                        className={styles.button}
                        disabled={loading || isVerified}
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
                            <span>Verify</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BankVerification;