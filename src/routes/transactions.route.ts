import express from "express";
import mongoose from "mongoose";
import { verifyToken } from "../middleware/auth.middleware";
import User from "../models/User.model";
import Transactions from "../models/Transactions.model";
import {
  transactionSchema,
  transactionTopUpSchema,
} from "../validator/transaction.validator";
import UserPayees from "../models/UserPayees.model";
import CreditHistory from "../models/CreditHistory.model";

const transactionRoutes = express.Router();

transactionRoutes.post("/send", verifyToken, async (req: any, res: any) => {
  const { error } = transactionSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    const senderId = req.user?.userId;
    const { recipientId, amount, message } = req.body;

    // Validate input
    if (!recipientId || !amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid input" });
    }

    if (senderId === recipientId) {
      return res.status(400).json({ error: "Cannot send to yourself" });
    }

    // Find sender and recipient
    const [sender, recipient, recipientPayeeExists] = await Promise.all([
      User.findById(senderId),
      User.findById(recipientId),
      UserPayees.findOne({
        userId: senderId,
        addedPayees: { $in: [recipientId] },
      }),
    ]);

    // Validate both users exist
    if (!sender || !recipient) {
      return res.status(404).json({ error: "Sender or recipient not found" });
    }

    // Check if recipient is a payee
    if (!recipientPayeeExists) {
      return res.status(400).json({ error: "Recipient is not a payee" });
    }

    // Check sufficient balance
    if (sender.balance < amount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    // Update balances - using atomic operations
    await Promise.all([
      User.findByIdAndUpdate(senderId, { $inc: { balance: -amount } }),
      User.findByIdAndUpdate(recipientId, { $inc: { balance: amount } }),
    ]);

    // Get updated balances
    const [updatedSender, updatedRecipient] = await Promise.all([
      User.findById(senderId),
      User.findById(recipientId),
    ]);

    // Create credit history entries
    await CreditHistory.create([
      {
        userId: senderId,
        recipientId: recipientId,
        status: "DEBITED",
        amount,
        isTopUp: false,
      },
      {
        userId: recipientId,
        recipientId: senderId,
        status: "CREDITED",
        amount,
        isTopUp: false,
      },
    ]);
    // Create transaction record
    const transaction = new Transactions({
      sender: sender._id,
      recipient: recipient._id,
      amount,
      status: "completed",
      message,
      balanceAfterSender: updatedSender?.balance || sender.balance - amount,
      balanceAfterRecipient:
        updatedRecipient?.balance || recipient.balance + amount,
      processedAt: new Date(),
    });

    await transaction.save();

    return res.status(200).json({
      success: true,
      message: "Transaction completed successfully",
    });
  } catch (err) {
    console.error("Transaction error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

transactionRoutes.get("/all", verifyToken, async (req: any, res: any) => {
  try {
    const userId = req.user?.userId;
    const transactions = await Transactions.find({
      $or: [{ sender: userId }, { recipient: userId }],
    })
      .populate("sender", "-password -otp -otpExpiresAt")
      .populate("recipient", "-password -otp -otpExpiresAt")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, transactions });
  } catch (err) {
    console.error("Error fetching transactions:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

transactionRoutes.post("/top-up", verifyToken, async (req: any, res: any) => {
  const { error } = transactionTopUpSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  const { amount } = req.body;
  if (parseInt(amount) <= 0) {
    return res.status(400).json({ error: "Invalid amount" });
  }
  try {
    const userId = req.user?.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    user.balance += parseInt(amount, 10);
    await user.save();
    const transaction = new Transactions({
      sender: user._id,
      recipient: user._id,
      amount,
      status: "completed",
      message: "Top-up",
      balanceAfterSender: user.balance,
      balanceAfterRecipient: user.balance,
      processedAt: new Date(),
    });
    await CreditHistory.create([
      {
        userId: userId,
        recipientId: user._id,
        status: "CREDITED",
        amount,
        isTopUp: true,
      },
    ]);
    await transaction.save();
    return res
      .status(200)
      .json({ success: true, message: "Top up added successfully" });
  } catch (err) {
    console.error("Error processing top-up:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

transactionRoutes.get(
  "/credit-history",
  verifyToken,
  async (req: any, res: any) => {
    try {
      const userId = req.user?.userId;
      const creditHistory = await CreditHistory.find({ userId }).sort({
        createdAt: -1,
      });
      return res.status(200).json({ success: true, creditHistory });
    } catch (err) {
      console.error("Error fetching credit history:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

transactionRoutes.get("/:id", verifyToken, async (req: any, res: any) => {
  try {
    const userId = req.user?.userId;
    const transactionId = req.params.id;
    const transaction = await Transactions.findOne({
      _id: transactionId,
      $or: [{ sender: userId }, { recipient: userId }],
    })
      .populate("sender", "-password -otp -otpExpiresAt")
      .populate("recipient", "-password -otp -otpExpiresAt");
    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }
    return res.status(200).json({ success: true, transaction });
  } catch (err) {
    console.error("Error fetching transaction:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

transactionRoutes.get("/all/admin", verifyToken, async (req: any, res: any) => {
  try {
    const transactions = await Transactions.find()
      .populate("sender", "-password -otp -otpExpiresAt")
      .populate("recipient", "-password -otp -otpExpiresAt")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, transactions });
  } catch (err) {
    console.error("Error fetching all transactions:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default transactionRoutes;
