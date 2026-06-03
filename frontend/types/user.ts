export interface User {
    _id: string
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: "admin" | "user" | "inspector";
    otpCode: string;
    otpExpiry: Date;
    resetToken: string;
    resetTokenExpiry: Date;
}


export interface UserRegistration {
    firstName: string
    lastName: string
    email: string
    password: string
}