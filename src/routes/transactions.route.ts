import express from "express";
import mongoose from "mongoose";
import { verifyToken } from "../middleware/auth.middleware";
import User from "../models/User.model";
import Transactions from "../models/Transactions.model";
import { transactionSchema } from "../validator/transaction.validator";
import UserPayees from "../models/UserPayees.model";

const transactionRoutes = express.Router();

transactionRoutes.post("/send", verifyToken, async (req: any, res: any) => {
  const { error } = transactionSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
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

    const recipientExists = await User.findById(recipientId).session(session);

    if (!recipientExists) {
      return res.status(404).json({ error: "Recipient not found" });
    }

    const sender = await User.findById(senderId).session(session);
    const recipient = await User.findById(recipientId).session(session);

    if (!sender || !recipient) {
      return res.status(404).json({ error: "Sender or recipient not found" });
    }

    if (sender.balance < amount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    const recipientPayeeExists = await UserPayees.findOne({
      userId: senderId,
      addedPayees: { $in: [recipientId] },
    }).session(session);
    
    if (!recipientPayeeExists) {
      return res.status(400).json({ error: "Recipient is not a payee" });
    }

    sender.balance -= amount;
    recipient.balance += amount;

    await sender.save({ session });
    await recipient.save({ session });

    const transaction = new Transactions({
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

export default transactionRoutes;
