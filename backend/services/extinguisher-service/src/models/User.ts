import mongoose, { Document } from "mongoose";

export interface IUser extends Document {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: "admin" | "user" | "inspector";
    otpCode: string;
    otpExpiry: Date;
    resetToken: string;
    resetTokenExpiry: Date;
    createdAt: Date
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
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.model<IUser>("User", userSchema);