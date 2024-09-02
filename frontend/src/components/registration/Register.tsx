"use client"; // Ensures that this component is rendered on the client side

import React, { ChangeEvent, FormEvent, useState } from "react"; // Importing necessary hooks and types from React
import axios from "axios"; // Axios library for making HTTP requests
import styles from "./register.module.css"; // Importing CSS module for styling
import { useRouter } from "next/navigation"; // Router hook for navigating between pages
import { toast, Toaster } from "react-hot-toast"; // Toast library for displaying notifications
import ClipLoader from "react-spinners/ClipLoader"; // Spinner component for loading state

// Interface for defining the structure of form data
interface FormData {
  name: string;
  email: string;
  phone: string;
  aadhar: string;
  dob: string;
}

// Main functional component for the registration form
const Registration: React.FC = () => {
  // State to store form data with initial empty values
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    aadhar: "",
    dob: "",
  });

  // State to track if the form is verified (after successful submission)
  const [isVerified, setIsVerified] = useState<boolean>(false);
  
  // State to track if the form is currently loading (during submission)
  const [loading, setLoading] = useState<boolean>(false);

  // Router hook for programmatic navigation
  const router = useRouter();

  // Event handler to update form data when an input value changes
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    // Updating the corresponding field in formData using the input name attribute
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Function to validate the form data before submission
  const validateForm = (): boolean => {
    const { name, email, phone, aadhar, dob } = formData; // Destructure form data fields for validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Regular expression for email validation
    const phoneRegex = /^[0-9]{10}$/; // Regular expression for phone number validation (10 digits)
    const aadharRegex = /^[0-9]{12}$/; // Regular expression for Aadhar number validation (12 digits)

    // Validation checks with error messages using toast
    if (name.trim().length < 3 || name.trim().length > 20) {
      toast.error("Name must be between 3 and 20 characters.");
      return false;
    }
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address.");
      return false;
    }
    if (!phoneRegex.test(phone)) {
      toast.error("Phone number must be exactly 10 digits.");
      return false;
    }
    if (!aadharRegex.test(aadhar)) {
      toast.error("Aadhar number must be exactly 12 digits.");
      return false;
    }
    if (new Date(dob).toString() === "Invalid Date") {
      toast.error("Please enter a valid date of birth.");
      return false;
    }

    return true; // All validations passed
  };

  // Event handler for form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); // Prevent default form submission behavior
    if (!validateForm()) {
      return; // If validation fails, exit the function
    }
    setLoading(true); // Set loading state to true while the form is being submitted
    try {
      // Sending POST request to the server with form data
      const { data } = await axios.post(
        "http://localhost:5000/api/users/register",
        formData
      );

      // On successful registration, show success toast and store userId in localStorage
      toast.success("User registered successfully");
      localStorage.setItem("userId", data.userId);
      setIsVerified(true); // Update state to indicate successful registration
      setTimeout(() => {
        router.push("/Verification/phone"); // Navigate to the next page after a short delay
      }, 1100);
    } catch (error) {
      // Handle registration failure by showing error toast
      console.error("Registration failed:", error);
      toast.error("Registration failed. Please try again.");
    } finally {
      setLoading(false); // Reset loading state after the request is complete
    }
  };

  // Component return: the JSX for rendering the registration form
  return (
    <div className={styles.wrapper}> {/* Wrapper div for styling */}
      <Toaster toastOptions={{ duration: 1100 }} /> {/* Toaster component for displaying toast notifications */}
      <form onSubmit={handleSubmit} className={styles.formElement}> {/* Form element with submit handler */}
        <header className={styles.header}>Registration form</header> {/* Form header */}

        {/* Input fields for user data */}
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Name"
          required
          disabled={isVerified} // Disable input if the form is already verified
          className={styles.inputField} // CSS module class for styling
        />
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          required
          disabled={isVerified}
          className={styles.inputField}
        />
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Phone"
          required
          disabled={isVerified}
          className={styles.inputField}
        />

        <input
          type="text"
          name="aadhar"
          value={formData.aadhar}
          onChange={handleChange}
          placeholder="Aadhar Number"
          required
          disabled={isVerified}
          className={styles.inputField}
        />
        <input
          type="date"
          name="dob"
          value={formData.dob}
          onChange={handleChange}
          placeholder="Date of Birth"
          required
          disabled={isVerified}
          className={styles.inputField}
        />

        {/* Submit button with loading spinner or text based on state */}
        <button
          type="submit"
          className={styles.button}
          disabled={loading || isVerified} // Disable button if loading or already verified
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
            <span>Registered</span> // Display "Registered" if the form is verified
          ) : (
            <span>Register</span> // Display "Register" if not loading and not verified
          )}
        </button>
      </form>
    </div>
  );
};

export default Registration; // Exporting the component for use in other parts of the application
