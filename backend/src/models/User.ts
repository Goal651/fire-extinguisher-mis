import mongoose from "mongoose";

export interface IUser {
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

export const userSchema = new mongoose.Schema<IUser>({
    firstName: {
        type: String,
        required: true,
    },

    lastName: {
        type: String,
        required: true,
    },

    email: {
        type: String,
        required: true,
        unique: true,
    },

    password: {
        type: String,
        required: true,
    },

    role: {
        type: String,
        enum: ["admin", "user", "inspector"],
        default: "user",
    },
    otpCode: {
        type: String,
    },
    otpExpiry: {
        type: Date,
    },
    resetToken: {
        type: String,
    },
    resetTokenExpiry: {
        type: Date,
    }
});

export default mongoose.model<IUser>("User", userSchema);