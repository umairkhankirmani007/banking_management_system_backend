import mongoose, { Document, Schema } from "mongoose";

export interface IContact extends Document {
  email: string;
  subject: string;
  message: string;
  date: Date;
}

const ContactSchema: Schema = new Schema(
  {
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Contact = mongoose.model<IContact>("Contact", ContactSchema);

export default Contact;
