import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcryptjs";

import { connectDB } from "../config/db";

import Admin from "../models/Admin";

const seedAdmin = async () => {
  try {
    await connectDB();

    const exists = await Admin.findOne({
      email: "aimable.kwizera14@gmail.com",
    });

    if (exists) {
      console.log("Admin already exists");

      process.exit(0);
    }

    const hashed = await bcrypt.hash("Admin@123", 12);

    await Admin.create({
      name: "System Admin",
      email: "aimable.kwizera14@gmail.com",
      password: hashed,
    });

    console.log("Admin created successfully");

    console.log("Email: aimable.kwizera14@gmail.com");

    console.log("Password: Admin@123");

    process.exit(0);
  } catch (error) {
    console.error(error);

    process.exit(1);
  }
};

seedAdmin();
