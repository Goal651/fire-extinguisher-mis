export type UserRole = "admin" | "inspector" | "user";

export interface User {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: UserRole;
    otpCode: string;
    otpExpiry: Date;
    resetToken: string;
    resetTokenExpiry: Date;
}

/** Represents the currently logged-in user (returned by /auth/me) */
export interface Admin {
    _id: string;
    name: string;
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
}

export interface UserRegistration {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}