import express from "express";
import authRoutes from "./auth.route";
import userRoutes from "./user.route";
import { verifyToken } from "../middleware/auth.middleware";
import userPayeeRoutes from "./userPayees.routes";
import transactionRoutes from "./transactions.route";
import contactRoute from "./csr.route";
const router = express.Router();

// Register routes
router.use("/auth", authRoutes);
router.use("/users", verifyToken, userRoutes);
router.use("/payees", verifyToken, userPayeeRoutes);
router.use("/transactions", verifyToken, transactionRoutes);
router.use("/contact", verifyToken, contactRoute);
export default router;
