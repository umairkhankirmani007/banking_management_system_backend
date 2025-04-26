import express from "express";
import { activityPostSchema } from "../validator/activity.validator";
import { verifyToken } from "../middleware/auth.middleware";
import Activity from "../models/Activity.model";

const activityRoute = express.Router();

activityRoute.post("/", verifyToken, async (req: any, res: any) => {
  try {
    const { error } = activityPostSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const { activity } = req.body;
    const userId = req.user?.userId;
    await Activity.create({ userId, activity });
    return res.status(201).json({ message: "Activity created successfully" });
  } catch (error) {
    console.error("Error creating activity:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

activityRoute.get("/", verifyToken, async (req: any, res: any) => {
  try {
    const userId = req.user?.userId;
    const activities = await Activity.find({ userId }).sort({ createdAt: -1 });
    if (!activities) {
      return res.status(404).json({ error: "No activities found" });
    }
    return res.status(200).json({ activities, message: "Activities fetched successfully" });
  } catch (error) {
    console.error("Error creating activity:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default activityRoute;
