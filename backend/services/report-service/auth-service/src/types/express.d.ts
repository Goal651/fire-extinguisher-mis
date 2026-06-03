import { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      admin?: JwtPayload | string;
    }
  }
}

export {};
