'use client'; // Ensures that this component is rendered on the client side

import React, { useState, ChangeEvent } from 'react'; // Importing necessary hooks and types from React
import styles from './verifyAddress.module.css'; // Importing CSS module for styling
import ClipLoader from "react-spinners/ClipLoader"; // Spinner component for loading state
import axios from 'axios'; // Axios library for making HTTP requests
import { toast, Toaster } from "react-hot-toast"; // Toast library for displaying notifications

// Interface for defining the structure of address details
interface AddressDetails {
  city: string; 
  district: string;
  state: string;
  country: string;
}

// Main functional component for address verification
const AddressVerification: React.FC = () => { 
    // State to store the user's pincode input
    const [pincode, setPincode] = useState<string>("");
    
    // State to store any error message
    const [error, setError] = useState<string>("");
    
    // State to track if the verification is in progress (loading state)
    const [loading, setLoading] = useState<boolean>(false);
    
    // State to store fetched address details after successful verification
    const [addressDetails, setAddressDetails] = useState<AddressDetails | null>(null);

    // Event handler to update pincode when the user types in the input field
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newPincode = e.target.value;
        setPincode(newPincode); // Update pincode state
        setError(""); // Clear any existing error message
        setAddressDetails(null); // Clear previous address details if any
    };

    // Function to verify the pincode by calling an external API
    const verifyPincode = async () => {
      // Validate the pincode format before making the API call
      if (!validatePincode(pincode)) {
          setError("Invalid Pincode format. It should be a 6-digit number."); // Set error message for invalid pincode
          return; // Exit the function if the pincode is invalid
      }

      setLoading(true); // Set loading state to true while fetching data
      try {
          // Make an API request to fetch address details based on the pincode
          const response = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`);
          console.log(response.data); // Log the API response data for debugging

          // Check if the API response status is 'Success' and extract address details
          if (response.data[0].Status === "Success") {
              const postOffice = response.data[0].PostOffice[0];
              setAddressDetails({
                  city: postOffice.Block,
                  district: postOffice.District,
                  state: postOffice.State,
                  country: postOffice.Country
              });
              toast.success('Pincode data fetched successfully'); // Show success notification
          } else {
              setError("No details found for this pincode"); // Set error message if no details are found
              toast.error("Failed to verify pincode"); // Show error notification
          }
      } catch (error) {
          console.error('Error verifying Pincode:', error); // Log error to console for debugging
          toast.error("An unexpected error occurred, please try again"); // Show error notification for unexpected errors
      } finally {
          setLoading(false); // Reset loading state after the request is complete
      }
    }

    // Function to validate the pincode format using a regular expression
    const validatePincode = (pincode: string): boolean => {
      const regex = /^[1-9][0-9]{5}$/; // Regular expression to match 6-digit pincodes starting with 1-9
      return regex.test(pincode); // Return true if the pincode matches the regex, false otherwise
    }

    // Component return: JSX for rendering the address verification form
    return (
        <div className={styles.wrapper}> {/* Wrapper div for styling */}
            <Toaster toastOptions={{ duration: 1200 }} /> {/* Toaster component for displaying toast notifications */}
            <div className={styles.formContainer}> {/* Container for the form elements */}
              
                <label className={styles.label}>
                    Enter your Pincode
                </label> {/* Label for the pincode input field */}
                
                <div className={styles.inputContainer}> {/* Container for input elements */}
                    <input 
                        type="text" 
                        placeholder='Enter your Pincode' 
                        name='pincode' 
                        required 
                        value={pincode} 
                        onChange={handleChange}   
                        maxLength={6} // Limit input length to 6 digits for pincode
                    />
                </div>

                {/* Display error message if there is an error */}
                {error && <div className={styles.errorMessage}>{error}</div>}
                
                <div className={styles.buttonContainer}> {/* Container for the submit button */}
                    <button
                        onClick={verifyPincode} // Button click triggers pincode verification
                        className={styles.button}
                        disabled={loading} // Disable button if loading is true
                    > 
                        {loading ?(<> 
                        fetching data
                            <ClipLoader
                                color={"#ffffff"}
                                loading={loading}
                                size={20}
                                aria-label="Loading Spinner"
                                data-testid="loader"
                            />
                        </>) : (
                            <span>Check locality</span> // Button text changes based on loading state
                        )}
                    </button>
                </div>

                {/* Display address details if they are available */}
                {addressDetails && (
                    <div className={styles.addressDetails}>
                        <h2>Address Details:</h2>
                        <p>City: {addressDetails.city}</p>
                        <p>District: {addressDetails.district}</p>
                        <p>State: {addressDetails.state}</p>
                        <p>Country: {addressDetails.country}</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default AddressVerification; // Exporting the component for use in other parts of the application
