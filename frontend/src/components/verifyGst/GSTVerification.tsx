'use client'
import React, { useState, ChangeEvent } from 'react';
import styles from './gst.module.css';
import ClipLoader from "react-spinners/ClipLoader";
import axios from 'axios';
import { toast, Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";

const GstVerification: React.FC = () => { 
    const [gstin, setGstin] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [isVerified, setIsVerified] = useState<boolean>(false);
    const router = useRouter();

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newGstin = e.target.value.toUpperCase(); // GSTIN is always uppercase
        setGstin(newGstin);
        setError(""); // Clear error when user types
    };

    const verifyGstin = async () => {
      if (!validateGstin(gstin)) {
          setError("Invalid GSTIN format. It should be in the format 22AAAAA0000A1Z5");
          return;
      }

      setLoading(true);
      try {
          const userId = localStorage.getItem('userId');
          const response = await axios.post('http://localhost:5000/api/users/verify-gstin', { gstin, userId });
          console.log(response.data);
          if (response.data.success) {
                 setIsVerified(true)
              toast.success('GSTIN verified successfully');
              setTimeout(() => {
                router.push("/Verification/bank");
            }, 1200); 
          } else {
              toast.error(response.data.message || "Failed to verify GSTIN");
          }
      } catch (error) {
          if (axios.isAxiosError(error) && error.response) {
              
              toast.error(error.response.data.message || "An error occurred while verifying GSTIN");
          } else {
             
              toast.error("An unexpected error occurred,try agaib");
          }
          console.error('Error verifying GSTIN:', error);
      } finally {
          setLoading(false);
      }
    }

    const validateGstin = (gstin: string): boolean => {
      // GSTIN format: 2 digits for state code, 10 characters for PAN, 1 for entity number, 
      // 1 for Z (default), 1 for check sum digit
      const regex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      return regex.test(gstin);
    }

    return (
        <div className={styles.wrapper}>
            <Toaster toastOptions={{ duration: 1200 }} />
            <div className={styles.formContainer}>
                <h1 className={styles.title}>
                    GSTIN Verification
                </h1>
                <label className={styles.label}>
                    Enter your GSTIN
                </label> 
                <div className={styles.inputContainer}>
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
                {error && <div className={styles.errorMessage}>{error}</div>}
                <div className={styles.buttonContainer}>
                <button
                        onClick={verifyGstin}
                        className={styles.button}
                        disabled={loading || isVerified}
                    >
                        {loading ? (<>
                           verifying <ClipLoader
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
                            <span>Verify GST</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default GstVerification;