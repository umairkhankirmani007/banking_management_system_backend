import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Extend the Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// JWT secret should be stored in environment variables
const JWT_SECRET = process.env.JWT_ACCESS_TOKEN_SECRET || "your-secret-key";

/**
 * Middleware to verify JWT token and add user details to request
 */
export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({ message: "Access denied. No token provided." });
      return;
    }

    // Check if the header has the Bearer format
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.substring(7)
      : authHeader;

    // Verify and decode the token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Append the decoded user information to the request object
    req.user = decoded;

    // Continue to the next middleware or route handler
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ message: "Invalid token." });
    } else if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: "Token expired." });
    } else {
      res.status(500).json({ message: "Internal server error." });
    }
  }
};
