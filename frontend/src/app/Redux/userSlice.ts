"use client";
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  name: string;
  email: string;
  phone: string;
  dob: string;
  aadhar: string;
  isVerified: {
    phone: boolean;
    email: boolean;
    aadhar: boolean;
    pan: boolean;
    bank: boolean;
    gst: boolean;
  };
}

const initialState: UserState = {
  name: '',
  email: '',
  phone: '',
  dob: '',
  aadhar: '',
  isVerified: {
    phone: false,
    email: false,
    aadhar: false,
    pan: false,
    bank: false,
    gst: false,
  },
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserDetails: (state, action: PayloadAction<Partial<UserState>>) => {
      return { ...state, ...action.payload };
    },
    setVerificationStatus: (state, action: PayloadAction<Partial<UserState['isVerified']>>) => {
      state.isVerified = { ...state.isVerified, ...action.payload };
    },
  },
});

export const { setUserDetails, setVerificationStatus } = userSlice.actions;
export default userSlice.reducer;