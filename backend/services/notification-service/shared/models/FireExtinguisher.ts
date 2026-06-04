import mongoose, { Document, Schema } from "mongoose";

export enum FireExtinguisherType {
  WATER = "WATER",
  CO2 = "CO2",
  FOAM = "FOAM",
  DRY_CHEMICAL = "DRY_CHEMICAL",
}

export enum FireExtinguisherSize {
  "2.5LBS" = "2.5LBS",
  "5LBS" = "5LBS",
  "9LBS" = "9LBS",
  "12LBS" = "12LBS",
}

export interface IInspectionLog {
  inspectedAt: Date;
  inspectorId: string;
  result: "pass" | "fail";
  notes?: string;
}

export interface IFireExtinguisher extends Document {
  extinguisherId: string;
  ownerName: string;
  ownerIdNumber: string;
  ownerEmail: string;
  ownerPhone: string;
  dateOfIssue: Date;
  expirationDate: Date;
  status: "active" | "expired" | "reported" | "police_notified";
  type: FireExtinguisherType;
  size: FireExtinguisherSize;
  alertSentAt?: Date | null;
  reminderSentAt?: Date | null;
  policeNotifiedAt?: Date | null;
  notes?: string;
  scheduledInspectionDate?: Date | null;
  inspectionStatus?: "none" | "pending" | "completed";
  scheduledMaintenanceDate?: Date | null;
  maintenanceStatus?: "none" | "scheduled" | "completed";
  maintenanceNotes?: string;
  inspectionLogs: IInspectionLog[];
  createdAt: Date;
  updatedAt: Date;
}

const extinguisherSchema = new Schema<IFireExtinguisher>(
  {
    extinguisherId: { type: String, required: true, unique: true },
    ownerName: { type: String, required: true },
    ownerIdNumber: { type: String, required: true },
    ownerEmail: { type: String, required: true },
    ownerPhone: { type: String, required: true },
    dateOfIssue: { type: Date, required: true },
    expirationDate: { type: Date, required: true },
    type: {
      type: String,
      enum: [FireExtinguisherType.WATER, FireExtinguisherType.CO2, FireExtinguisherType.FOAM, FireExtinguisherType.DRY_CHEMICAL],
      required: true,
    },
    size: {
      type: String,
      enum: [FireExtinguisherSize["2.5LBS"], FireExtinguisherSize["5LBS"], FireExtinguisherSize["9LBS"], FireExtinguisherSize["12LBS"]],
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "expired", "reported", "police_notified"],
      default: "active",
    },
    alertSentAt: { type: Date, default: null },
    reminderSentAt: { type: Date, default: null },
    policeNotifiedAt: { type: Date, default: null },
    notes: { type: String },
    scheduledInspectionDate: { type: Date, default: null },
    inspectionStatus: {
      type: String,
      enum: ["none", "pending", "completed"],
      default: "none",
    },
    scheduledMaintenanceDate: { type: Date, default: null },
    maintenanceStatus: {
      type: String,
      enum: ["none", "scheduled", "completed"],
      default: "none",
    },
    maintenanceNotes: { type: String },
    inspectionLogs: [
      {
        inspectedAt: { type: Date, default: Date.now },
        inspectorId: { type: String, required: true },
        result: { type: String, enum: ["pass", "fail"], required: true },
        notes: { type: String },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<IFireExtinguisher>(
  "FireExtinguisher",
  extinguisherSchema
);
