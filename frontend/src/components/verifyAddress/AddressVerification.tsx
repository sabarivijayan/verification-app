'use client'
import React, { useState, ChangeEvent } from 'react';
import styles from './verifyAddress.module.css';
import ClipLoader from "react-spinners/ClipLoader";
import axios from 'axios';
import { toast, Toaster } from "react-hot-toast";

interface AddressDetails {
  city: string; 
  district: string;
  state: string;
  country: string;
}

const AddressVerification: React.FC = () => { 
    const [pincode, setPincode] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [addressDetails, setAddressDetails] = useState<AddressDetails | null>(null);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newPincode = e.target.value;
        setPincode(newPincode);
        setError(""); // Clear error when user types
        setAddressDetails(null); // Clear previous address details
    };

    const verifyPincode = async () => {
      if (!validatePincode(pincode)) {
          setError("Invalid Pincode format. It should be a 6-digit number.");
          return;
      }

      setLoading(true);
      try {
          const response = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`);
          console.log(response.data);
          if (response.data[0].Status === "Success") {
              const postOffice = response.data[0].PostOffice[0];
              setAddressDetails({
                  city: postOffice.Block,
                  district: postOffice.District,
                  state: postOffice.State,
                  country: postOffice.Country
              });
              toast.success('Pincode data fetched successfully');
          } else {
              setError("No details found for this pincode");
              toast.error("Failed to verify pincode");
          }
      } catch (error) {
          console.error('Error verifying Pincode:', error);
          toast.error("An unexpected error occurred, please try again");
      } finally {
          setLoading(false);
      }
    }

    const validatePincode = (pincode: string): boolean => {
      const regex = /^[1-9][0-9]{5}$/;
      return regex.test(pincode);
    }

    return (
        <div className={styles.wrapper}>
            <Toaster toastOptions={{ duration: 1200 }} />
            <div className={styles.formContainer}>
              
                <label className={styles.label}>
                    Enter your Pincode
                </label> 
                <div className={styles.inputContainer}>
                    <input 
                        type="text" 
                        placeholder='Enter your Pincode' 
                        name='pincode' 
                        required 
                        value={pincode} 
                        onChange={handleChange}   
                        maxLength={6} // Pincode is always 6 digits
                    />
                </div>
                {error && <div className={styles.errorMessage}>{error}</div>}
                <div className={styles.buttonContainer}>
                    <button
                        onClick={verifyPincode}
                        className={styles.button}
                        disabled={loading}
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
                            <span>Check locality</span>
                        )}
                    </button>
                </div>
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

export default AddressVerification;