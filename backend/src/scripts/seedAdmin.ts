import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcryptjs";
import { connectDB } from "../config/db";
import User from "../models/User";

const seedAdmin = async () => {
  try {
    await connectDB();

    const targetEmail = "bugiriwilson651@gmail.com";

    const exists = await User.findOne({
      email: targetEmail,
    });

    if (exists) {
      console.log("Admin already exists");
      return
    }

    const hashed = await bcrypt.hash("Admin@123", 12);

    await User.create({
      firstName: "System",
      lastName: "Admin",
      email: targetEmail,
      password: hashed,
      role: "admin",
    });

    console.log("Admin created successfully");
    console.log(`Email: ${targetEmail}`);
    console.log("Password: Admin@123");

  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedAdmin();
