import mongoose, { Document, Schema } from "mongoose";
import { Types } from "mongoose";

export interface IUserToUserTransaction extends Document {
  sender: Types.ObjectId; // who is sending the money
  recipient: Types.ObjectId; // who is receiving the money
  amount: number;
  status: "pending" | "completed" | "failed";
  message?: string;
  //   reference: string; // unique transaction ID
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
    message: { type: String }, // optional message/note
    // reference: { type: String, required: true, unique: true },
    balanceAfterSender: { type: Number, required: true },
    balanceAfterRecipient: { type: Number, required: true },
    processedAt: { type: Date }, // timestamp when transaction was finalized
  },
  { timestamps: true } // createdAt will act as the time of request
);

const UserToUserTransaction = mongoose.model<IUserToUserTransaction>(
  "UserToUserTransaction",
  UserToUserTransactionSchema
);

export default UserToUserTransaction;
