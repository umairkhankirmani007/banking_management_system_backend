import mongoose, { Document, Schema } from "mongoose";

export interface UserPayees extends Document {
    userId: string;
    addedPayees: string[];
}

const UserPayeesSchema: Schema = new Schema(
  {
    userId: { type: String, required: true },
    addedPayees: { type: [String], required: true },
  },
  { timestamps: true }
);
const UserPayees = mongoose.model<UserPayees>("UserPayees", UserPayeesSchema);

export default UserPayees;
