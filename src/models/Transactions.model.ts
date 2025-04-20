import mongoose, { Document, Schema } from "mongoose";
import { Types } from "mongoose";

export interface IUserToUserTransaction extends Document {
  sender: Types.ObjectId; // who is sending the money
  recipient: Types.ObjectId; // who is receiving the money
  amount: number;
  status: "pending" | "completed" | "failed";
  message?: string;
  balanceAfterSender: number;
  balanceAfterRecipient: number;
  processedAt?: Date;
}

const UserToUserTransactionSchema: Schema = new Schema(
  {
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    recipient: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    message: { type: String },
    balanceAfterSender: { type: Number, required: true },
    balanceAfterRecipient: { type: Number, required: true },
    processedAt: { type: Date },
  },
  { timestamps: true }
);

const Transactions = mongoose.model<IUserToUserTransaction>(
  "Transactions",
  UserToUserTransactionSchema
);

export default Transactions;
