import { serverURL } from './serverURL';
import { commonAPI } from './commonAPI';

// Define types for the API request bodies
interface User {
    name: string;
    email: string;
    phone: string;
    aadhar: string;
}

interface Email {
    email: string;
}

interface OtpBody {
    email: string;
    otp: string;
}

// Register user
export const registerAPI = async (user: User): Promise<any> => {
    return await commonAPI("post", `${serverURL}/register`, user, undefined); // Use `undefined` instead of an empty string
}

// Verify email
export const verifyEmailAPI = async (email: Email): Promise<any> => {
    return await commonAPI("post", `${serverURL}/verify-email`, email, undefined); // Use `undefined` instead of an empty string
}

// Verify OTP
export const verifyOtpAPI = async (body: OtpBody): Promise<any> => {
    return await commonAPI("post", `${serverURL}/verify-otp`, body, undefined); // Use `undefined` instead of an empty string
}
