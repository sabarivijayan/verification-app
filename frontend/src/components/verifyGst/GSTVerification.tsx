'use client'; // Indicates that this component should be rendered on the client side

import React, { useState, ChangeEvent } from 'react'; // Importing necessary hooks and types from React
import styles from './gst.module.css'; // Importing CSS module for styling
import ClipLoader from "react-spinners/ClipLoader"; // Spinner component for indicating loading state
import axios from 'axios'; // Axios library for making HTTP requests
import { toast, Toaster } from "react-hot-toast"; // Toast library for displaying notifications
import { useRouter } from "next/navigation"; // Hook from Next.js for navigation

// Functional component for GSTIN verification
const GstVerification: React.FC = () => { 
    // State to store the user's GSTIN input
    const [gstin, setGstin] = useState<string>("");
    
    // State to store any error message related to input or verification
    const [error, setError] = useState<string>("");
    
    // State to track loading status during verification process
    const [loading, setLoading] = useState<boolean>(false);
    
    // State to track if GSTIN has been successfully verified
    const [isVerified, setIsVerified] = useState<boolean>(false);
    
    // Hook for navigating programmatically
    const router = useRouter();

    // Event handler to update the GSTIN state when the user types in the input field
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newGstin = e.target.value.toUpperCase(); // Convert GSTIN input to uppercase (as per standard format)
        setGstin(newGstin); // Update state with new GSTIN value
        setError(""); // Clear any existing error message when the user starts typing
    };

    // Function to validate and verify GSTIN using an API call
    const verifyGstin = async () => {
      // Validate the GSTIN format before making an API call
      if (!validateGstin(gstin)) {
          setError("Invalid GSTIN format. It should be in the format 22AAAAA0000A1Z5"); // Set error message for invalid format
          return; // Exit the function if the format is invalid
      }

      setLoading(true); // Set loading state to true while fetching data
      try {
          const userId = localStorage.getItem('userId'); // Retrieve userId from local storage
          
          // Make a POST request to verify GSTIN using the API
          const response = await axios.post('http://localhost:5000/api/users/verify-gstin', { gstin, userId });
          console.log(response.data); // Log response data for debugging
          
          // Check if the response indicates a successful verification
          if (response.data.success) {
              setIsVerified(true); // Update state to reflect successful verification
              toast.success('GSTIN verified successfully'); // Display success notification
              
              // Navigate to bank verification page after a short delay
              setTimeout(() => {
                router.push("/Verification/bank");
              }, 1200); 
          } else {
              toast.error(response.data.message || "Failed to verify GSTIN"); // Display error message if verification fails
          }
      } catch (error) {
          // Check if the error is an Axios error with a response
          if (axios.isAxiosError(error) && error.response) {
              toast.error(error.response.data.message || "An error occurred while verifying GSTIN"); // Display error message from server
          } else {
              toast.error("An unexpected error occurred,try agaib"); // Display generic error message for unexpected errors
          }
          console.error('Error verifying GSTIN:', error); // Log the error to console for debugging
      } finally {
          setLoading(false); // Reset loading state after request is complete
      }
    }

    // Function to validate the format of the GSTIN using a regular expression
    const validateGstin = (gstin: string): boolean => {
      // GSTIN format: 2 digits for state code, 10 characters for PAN, 1 for entity number, 
      // 1 for Z (default), 1 for checksum digit
      const regex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      return regex.test(gstin); // Returns true if GSTIN matches the regex, false otherwise
    }

    // Component return: JSX for rendering the GSTIN verification form
    return (
        <div className={styles.wrapper}> {/* Wrapper div for styling */}
            <Toaster toastOptions={{ duration: 1200 }} /> {/* Toaster component for displaying toast notifications */}
            <div className={styles.formContainer}> {/* Container for the form elements */}
                <h1 className={styles.title}>
                    GSTIN Verification
                </h1> {/* Title for the verification form */}
                <label className={styles.label}>
                    Enter your GSTIN
                </label> {/* Label for GSTIN input field */}
                
                <div className={styles.inputContainer}> {/* Container for the input element */}
                    <input 
                        type="text" 
                        placeholder='Enter your GSTIN' 
                        name='gstin' 
                        required 
                        value={gstin} 
                        onChange={handleChange}   
                        maxLength={15} // GSTIN is always 15 characters
                    />
                </div>

                {/* Display error message if there is an error */}
                {error && <div className={styles.errorMessage}>{error}</div>}
                
                <div className={styles.buttonContainer}> {/* Container for the verify button */}
                    <button
                        onClick={verifyGstin} // Button click triggers GSTIN verification
                        className={styles.button}
                        disabled={loading || isVerified} // Disable button if loading or already verified
                    >
                        {loading ? (<> 
                           verifying 
                           <ClipLoader
                                color={"#ffffff"}
                                loading={loading}
                                size={20}
                                aria-label="Loading Spinner"
                                data-testid="loader"
                            />
                        </>) : isVerified ? ( // Show verified text if GSTIN is already verified
                            <span>Verified</span>
                        ) : ( // Default text for button before verification
                            <span>Verify GST</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default GstVerification; // Exporting the component for use in other parts of the application
