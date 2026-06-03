import mongoose, { Document, Schema } from "mongoose";
import { IUser } from "./User";

export enum FireExtinguisherType {
  WATER= "WATER",
  CO2= "CO2",
  FOAM= "FOAM",
  DRY_CHEMICAL= "DRY_CHEMICAL"
}

export enum FireExtinguisherSize {
  "2.5LBS"= "2.5LBS",
  "5LBS"= "5LBS",
  "9LBS"= "9LBS",
  "12LBS"= "12LBS"
}

export interface IFireExtinguisher extends Document {
  serialNumber: string,
  location: string,
  type: FireExtinguisherType,
  size: FireExtinguisherSize,
  installationDate: Date,
  expireationDate: Date,
  lastInspectionDate: Date,
  nextInspectionDate: Date,
  status: "active" | "expired" | "reported",
  owner:IUser
}

const extinguisherSchema = new Schema<IFireExtinguisher>(
  {
    serialNumber: { type: String, required: true, unique: true },
    location: { type: String, required: true },
    type: { type: String, enum: Object.values(FireExtinguisherType), required: true },
    size: { type: String, enum: Object.values(FireExtinguisherSize), required: true },
    installationDate: { type: Date, required: true },
    expireationDate: { type: Date, required: true },
    lastInspectionDate: { type: Date, required: true },
    nextInspectionDate: { type: Date, required: true },
    status: { type: String, enum: ["active", "expired", "reported"], default: "active" },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
);


export default mongoose.model<IFireExtinguisher>(
  "FireExtinguisher",
  extinguisherSchema,
);
