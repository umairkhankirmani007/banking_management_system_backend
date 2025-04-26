import mongoose, { Document, Schema } from "mongoose";

export interface Activity extends Document {
  userId: string;
  activity: any;
}

const ActivitySchema: Schema = new Schema(
  {
    userId: { type: String, required: true },
    activity: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);
const Activity = mongoose.model<Activity>(
  "Activity",
  ActivitySchema
);

export default Activity;
