import express from "express";
import User from "../models/User";
const userRoutes = express.Router();

userRoutes.get("/", async (req: any, res: any) => {
  try {
    const requestedUser = req.user;
    const user = await User.findOne({
      _id: requestedUser.userId,
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User details fetched successfully",
      data: {
        userId: user._id,
        name: user.name,
        email: user.email,
        imageUrl: user.imageUrl,
        balance: user.balance,
        age: user.age,
        phoneNumber: user.phoneNumber,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating user details", error });
  }
});

export default userRoutes;
