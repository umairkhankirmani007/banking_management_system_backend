import express from "express";
import mongoose from "mongoose";
import { verifyToken } from "../middleware/auth.middleware";
import User from "../models/User.model";
import UserToUserTransaction from "../models/Transactions.model";

const router = express.Router();

// /**
//  * @route POST /api/transactions/send
//  * @desc Send money to another user
//  * @access Private (Requires JWT)
//  */
router.post("/send", verifyToken, async (req: any, res: any) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const senderId = req.user?.userId;
    const { recipientId, amount, message } = req.body;

    if (!recipientId || !amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid input" });
    }

    if (senderId === recipientId) {
      return res.status(400).json({ error: "Cannot send to yourself" });
    }

    const sender = await User.findById(senderId).session(session);
    const recipient = await User.findById(recipientId).session(session);

    if (!sender || !recipient) {
      return res.status(404).json({ error: "Sender or recipient not found" });
    }

    if (sender.balance < amount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    sender.balance -= amount;
    recipient.balance += amount;

    await sender.save({ session });
    await recipient.save({ session });

    const transaction = new UserToUserTransaction({
      sender: sender._id,
      recipient: recipient._id,
      amount,
      status: "completed",
      message,
      balanceAfterSender: sender.balance,
      balanceAfterRecipient: recipient.balance,
      processedAt: new Date(),
    });

    await transaction.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({ success: true, transaction });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("Transaction error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
