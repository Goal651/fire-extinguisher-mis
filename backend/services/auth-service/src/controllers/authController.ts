import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";

import User, { IUser} from "../models/User";

import { generateOTP } from "../utils/generateOTP";
import { generateToken } from "../utils/generateToken";

import {
  sendEmail,
  buildOtpHtml,
  buildPasswordResetHtml,
  buildPasswordChangedHtml,
} from "../emailService";
import { logger } from "../utils/logger";

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      logger.warn(`Login attempt with non-existent email: ${email}`);
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      logger.warn(`Failed login attempt for email: ${email}`);
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const otp = generateOTP();

    // Save OTP and its expiration (10 minutes)
    user.otpCode = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendEmail(
      email,
      "Your OTP Code",
      buildOtpHtml(otp),
    );

    logger.info(`OTP sent successfully to: ${email}`);

    return res.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    logger.error("Login failed", error);
    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      logger.warn(`OTP verification attempt for non-existent email: ${email}`);
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (!user.otpCode || user.otpCode !== otp || !user.otpExpiry || user.otpExpiry < new Date()) {
      logger.warn(`Invalid or expired OTP for: ${email}`);
      return res.status(401).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    // Clear OTP fields upon successful verification
    user.otpCode = "";
    user.otpExpiry = new Date(0);
    await user.save();

    const token = generateToken(user._id.toString(), user.email, user.role);

    logger.info(`OTP verified successfully for: ${email}`);

    return res.json({
      success: true,
      token,
      admin: {
        _id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error("OTP verification failed", error);
    return res.status(500).json({
      success: false,
      message: "Verification failed",
    });
  }
};

export const resendOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const otp = generateOTP();

    // Save OTP and its expiration (10 minutes)
    user.otpCode = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendEmail(
      email,
      "Your OTP Code",
      buildOtpHtml(otp),
    );

    logger.info(`OTP resent successfully to: ${email}`);

    return res.json({
      success: true,
      message: "OTP resent successfully",
    });
  } catch (error) {
    logger.error("Resend OTP failed", error);
    return res.status(500).json({
      success: false,
      message: "Failed to resend OTP",
    });
  }
};

export const me = async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    return res.json({
      success: true,
      data: user,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  logger.info("User logged out");
  return res.json({
    success: true,
    message: "Logged out successfully",
  });
};

export const register = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      logger.warn(`Registration attempt with existing email: ${email}`);
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    logger.info(`New user registered: ${email}`);

    return res.status(201).json({
      success: true,
      message: "Registration successful. Please login.",
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (error) {
    logger.error("Registration failed", error);
    return res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      logger.warn(`Password reset requested for non-existent email: ${email}`);
      return res.status(404).json({
        success: false,
        message: "No account found with this email",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    await sendEmail(
      email,
      "Password Reset Request",
      buildPasswordResetHtml(resetUrl),
    );

    logger.info(`Password reset email sent to: ${email}`);

    return res.json({
      success: true,
      message: "Password reset email sent",
    });
  } catch (error) {
    logger.error("Forgot password failed", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send reset email",
    });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      logger.warn(`Invalid or expired reset token used`);
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    user.password = hashedPassword;
    user.resetToken = ''
    user.resetTokenExpiry = new Date(0);
    await user.save();

    logger.info(`Password reset successful for: ${user.email}`);

    await sendEmail(
      user.email,
      "Password Reset Successful",
      buildPasswordChangedHtml("reset"),
    );

    return res.json({
      success: true,
      message:
        "Password reset successful. Please login with your new password.",
    });
  } catch (error) {
    logger.error("Reset password failed", error);
    return res.status(500).json({
      success: false,
      message: "Password reset failed",
    });
  }
};

export const updateProfile = async (req: any, res: Response) => {
  try {
    const { firstName, lastName, email } = req.body as IUser;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (email && email.toLowerCase() !== user.email) {
      const existingAdmin = await User.findOne({ email: email.toLowerCase() });

      if (existingAdmin) {
        return res.status(400).json({
          success: false,
          message: "Email already in use",
        });
      }

      user.email = email.toLowerCase();
    }

    if (firstName) {
      user.firstName = firstName;
    }

    if (lastName) {
      user.lastName = lastName;
    }

    await user.save();

    logger.info(`Profile updated for: ${user.email}`);

    return res.json({
      success: true,
      message: "Profile updated successfully",
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (error) {
    logger.error("Update profile failed", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};

export const changePassword = async (req: any, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      logger.warn(`Incorrect current password for: ${user.email}`);
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    user.password = hashedPassword;
    await user.save();

    logger.info(`Password changed for: ${user.email}`);

    await sendEmail(
      user.email,
      "Password Changed Successfully",
      buildPasswordChangedHtml("changed"),
    );

    return res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    logger.error("Change password failed", error);
    return res.status(500).json({
      success: false,
      message: "Failed to change password",
    });
  }
};
