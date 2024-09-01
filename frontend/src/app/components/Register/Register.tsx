"use client";

import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../Redux/store'; 
import { setUserDetails } from '../../Redux/userSlice';
import styles from './register.module.css';
import { registerAPI } from '../../Services/allAPI';
import { useRouter } from 'next/navigation';

// Define the types for form data and errors
interface FormData {
  name: string;
  email: string;
  phone: string;
  dob: string;
  aadhar: string;
}

interface FormErrors {
  name: string;
  email: string;
  phone: string;
  dob: string;
  aadhar: string;
}

function Register() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    dob: "",
    aadhar: "",
  });

  const [errors, setErrors] = useState<FormErrors>({
    name: "",
    email: "",
    phone: "",
    dob: "",
    aadhar: "",
  });

  const dispatch = useDispatch();
  const router = useRouter();
  const userReduxState = useSelector((state: RootState) => state.user);

  const validateField = (name: keyof FormData, value: string): string => { // Updated the name and return type
    let error = "";
    switch (name) {
      case "name":
        if (!/^[a-zA-Z\s]+$/.test(value)) {
          error = "Name must contain only letters and spaces.";
        }
        break;
      case "email":
        if (!/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(value)) {
          error = "Invalid email format.";
        }
        break;
      case "phone":
        if (!/^\d{10}$/.test(value)) {
          error = "Phone number must be 10 digits.";
        }
        break;
      case "aadhar":
        if (!/^\d{12}$/.test(value)) {
          error = "Aadhar number must be 12 digits.";
        }
        break;
      default:
        break;
    }
    return error;
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));

    const error = validateField(name as keyof FormData, value); // Type assertion to match FormData keys
    setErrors(prevState => ({
      ...prevState,
      [name]: error,
    }));
  };

  const handleSubmit = async(e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const isAnyFieldEmpty = Object.values(formData).some(value => value.trim() === '');
    const isAnyFieldInvalid = Object.values(errors).some(error => error !== '');
    
    if (isAnyFieldEmpty) {
      alert('Please fill all fields');
      return;
    }
    if (isAnyFieldInvalid) {
      alert('Please fix the errors in the form.');
      return;
    }

    dispatch(setUserDetails(formData));
    try {
      const result = await registerAPI(formData);
      console.log(result);
      if(result.status === 200){
        alert('Registration Success');
        router.push('/VerifyEmail');
      } else {
        alert(result.response.data);
      }
    } catch (error) {
      console.error('Error during registration:', error);
    }
  };

  return (
    <div>
      <div className={styles.container}>
        <div className={styles.inputFields}>
          <form onSubmit={handleSubmit} className={styles.formContent}>
            <label className={styles.fieldName} htmlFor="name">Full Name</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleInputChange} 
              className={errors.name ? styles.errorInput : ''}
            />
            {errors.name && <p className={styles.errorMessage}>{errors.name}</p>}

            <label className={styles.fieldName} htmlFor="email">Email Address</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleInputChange} 
              className={errors.email ? styles.errorInput : ''}
            />
            {errors.email && <p className={styles.errorMessage}>{errors.email}</p>}

            <label className={styles.fieldName} htmlFor="phone">Phone Number</label>
            <input 
              type="tel" 
              name="phone" 
              value={formData.phone} 
              onChange={handleInputChange} 
              className={errors.phone ? styles.errorInput : ''}
            />
            {errors.phone && <p className={styles.errorMessage}>{errors.phone}</p>}

            <label className={styles.fieldName} htmlFor="dob">Date of Birth</label>
            <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} className={styles.dobfield}
            />

            <label className={styles.fieldName} htmlFor="aadhar">Aadhar No</label>
            <input 
              type="text" 
              name="aadhar" 
              value={formData.aadhar} 
              onChange={handleInputChange} 
              className={errors.aadhar ? styles.errorInput : ''}
            />
            {errors.aadhar && <p className={styles.errorMessage}>{errors.aadhar}</p>}

            <button className={styles.submitButton} type='submit'>Register</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
