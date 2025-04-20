import express from "express";
import authRoutes from "./auth.route";
import userRoutes from "./user.route";
import { verifyToken } from "../middleware/auth.middleware";
import transactionRoutes from "./transactions.route";

const router = express.Router();

// Register routes
router.use("/auth", authRoutes);
router.use("/users", verifyToken, userRoutes);
router.use("/transactions", verifyToken, transactionRoutes);

export default router;
