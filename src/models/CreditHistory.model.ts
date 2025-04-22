import mongoose, { Document, Schema } from "mongoose";

export interface CreditHistory extends Document {
  userId: string;
  recipientId: string;
  status: string;
  amount: number;
  isTopUp: boolean;
}

const UserCreditSchema: Schema = new Schema(
  {
    userId: { type: String, required: true },
    recipientId: { type: String, required: true },
    status: {
      type: String,
      enum: ["CREDITED", "DEBITED"],
      default: "CREDITED",
    },
    isTopUp: { type: Boolean, default: false },
    amount: { type: Number, required: true },
  },
  { timestamps: true }
);
const CreditHistory = mongoose.model<CreditHistory>(
  "CreditHistory",
  UserCreditSchema
);

export default CreditHistory;
