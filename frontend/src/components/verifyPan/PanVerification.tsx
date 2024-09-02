"use client"; // Ensures this component is rendered on the client-side

import React from "react"; // Import React
import { useState, ChangeEvent } from "react"; // Import hooks and types from React
import styles from "./panVerification.module.css"; // Import CSS module for styling
import ClipLoader from "react-spinners/ClipLoader"; // Import spinner component for loading state
import axios from "axios"; // Import axios for making HTTP requests
import { toast, Toaster } from "react-hot-toast"; // Import toast components for displaying notifications
import { useRouter } from "next/navigation"; // Import router hook for navigation

// Functional component for PAN verification
const PanVerification: React.FC = () => {
    // State to hold the PAN input value
    const [pan, setPan] = useState<string>("");
    
    // State to hold any error messages
    const [error, setError] = useState<string>("");
    
    // State to manage the loading state during API call
    const [loading, setLoading] = useState<boolean>(false);
    
    // State to check if PAN has been successfully verified
    const [isVerified, setIsVerified] = useState<boolean>(false);
    
    // Router hook for programmatically navigating between pages
    const router = useRouter();
    
    // Handler for input change event
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newPan = e.target.value; // Get the new value from input field
        setPan(newPan); // Update PAN state with new input
        setError(""); // Clear any existing error messages when user starts typing
    };

    // Function to validate and verify PAN via API call
    const verifyPan = async () => {
        // Validate the PAN format using regex before making an API call
        if (!validatePan(pan)) {
            setError("Invalid PAN format. It should be in the format ABCDE1234F"); // Set error message for invalid format
            return; // Exit the function if the PAN format is invalid
        }

        setLoading(true); // Set loading state to true to indicate the verification process
        try {
            const userId = localStorage.getItem("userId"); // Retrieve the userId from local storage
            // Make a POST request to the server to verify the PAN
            const response = await axios.post(
                "http://localhost:5000/api/users/verify-pan",
                { pan, userId }
            );
            console.log(response.data); // Log the response data for debugging purposes
            // Check if the response indicates successful verification
            if (response.data.success) {
                setIsVerified(true); // Update the state to indicate successful verification
                toast.success("PAN verified successfully"); // Show a success toast message
                // Navigate to the GST verification page after a delay
                setTimeout(() => {
                    router.push("/Verification/gst");
                }, 1200);
            } else {
                toast.error(response.data.message || "Failed to verify PAN"); // Show an error toast message if verification fails
            }
        } catch (error) {
            // Check if the error is an Axios error with a response from the server
            if (axios.isAxiosError(error) && error.response) {
                toast.error(
                    error.response.data.message || "An error occurred while verifying PAN"
                ); // Show server error message
            } else {
                toast.error("An unexpected error occurred"); // Show a generic error message for unexpected errors
            }
        } finally {
            setLoading(false); // Reset loading state after the request completes
        }
    };

    // Function to validate the PAN format using a regular expression
    const validatePan = (pan: string): boolean => {
        const regex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/; // Regex pattern for validating PAN format
        return regex.test(pan); // Returns true if PAN matches the regex pattern, false otherwise
    };

    // JSX structure of the component
    return (
        <div className={styles.wrapper}> {/* Wrapper div for styling */}
            <Toaster toastOptions={{ duration: 1200 }} /> {/* Toaster component for displaying toast notifications */}
            <div className={styles.formContainer}> {/* Container for the form elements */}
                <h1 className={styles.title}>Pan verfication</h1> {/* Title of the form */}
                <label className={styles.label}>
                    Enter your Pan Card number
                </label> {/* Label for the input field */}
                <div className={styles.inputContainer}> {/* Container for the input element */}
                    <input
                        type="text"
                        placeholder="Enter your pancard number"
                        name="pancard"
                        required
                        value={pan} // Bind input value to state
                        onChange={handleChange} // Update state on input change
                        disabled={loading} // Disable input during loading state
                    />
                </div>
                {/* Conditionally render error message if any */}
                {error && <div className={styles.errorMessage}>{error}</div>}
                <div className={styles.buttonContainer}> {/* Container for the verification button */}
                    <button
                        onClick={verifyPan} // Click handler to trigger verification
                        className={styles.button}
                        disabled={loading || isVerified} // Disable button during loading or if already verified
                    >
                        {loading ? ( // Conditional rendering based on loading state
                            <ClipLoader
                                color={"#ffffff"}
                                loading={loading}
                                size={20}
                                aria-label="Loading Spinner"
                                data-testid="loader"
                            />
                        ) : isVerified ? ( // Display verified state if PAN is verified
                            <span>Verified</span>
                        ) : ( // Default button text for verification
                            <span>Verify PAN</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PanVerification; // Exporting the component for use in other parts of the application
