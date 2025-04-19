import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  age: number;
  imageUrl: string;
  isVerified: boolean;
  otp: string;
  otpExpiresAt: Date;
  password: string;
  balance: 0;
}

const UserSchema: Schema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    firstName: { type: String },
    lastName: { type: String },
    phoneNumber: { type: String },
    age: { type: Number },
    imageUrl: { type: String },
    isVerified: { type: Boolean, default: false },
    otp: { type: String, default: null },
    otpExpiresAt: { type: Date, default: null },
    balance: { type: Number, default: 0 },
    password: { type: String },
  },
  { timestamps: true }
);
const User = mongoose.model<IUser>("User", UserSchema);

export default User;
