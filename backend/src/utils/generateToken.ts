import jwt from "jsonwebtoken";

export const generateToken = (id: string, email: string): string => {
  return jwt.sign(
    {
      id,
      email,
    },
    process.env.JWT_SECRET as string,
    {
      expiresIn: process.env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    },
  );
};
