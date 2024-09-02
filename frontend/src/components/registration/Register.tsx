"use client";
import React, { ChangeEvent, FormEvent, useState } from "react";
import axios from "axios";
import styles from "./Registration.module.css";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";
import ClipLoader from "react-spinners/ClipLoader";

interface FormData {
  name: string;
  email: string;
  phone: string;
  aadhar: string;
  dob: string;
}

const RegistrationForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    aadhar: "",
    dob: "",
  });
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = (): boolean => {
    const { name, email, phone, aadhar, dob } = formData;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;
    const aadharRegex = /^[0-9]{12}$/;

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

    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/users/register",
        formData
      );
      toast.success("User registered successfully");
      localStorage.setItem("userId", data.userId);
      setIsVerified(true);
      setTimeout(() => {
        router.push("/register/mobile");
      }, 1100);
    } catch (error) {
      console.error("Registration failed:", error);
      toast.error("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <Toaster toastOptions={{ duration: 1100 }} />
      <form onSubmit={handleSubmit} className={styles.formElement}>
        <header className={styles.header}>Registration form</header>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Name"
          required
          disabled={isVerified}
          className={styles.inputField}
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

        <button
          type="submit"
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
            <span>Registered</span>
          ) : (
            <span>Register</span>
          )}
        </button>
      </form>
    </div>
  );
};

export default RegistrationForm;
