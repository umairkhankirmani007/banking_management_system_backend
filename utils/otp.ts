import nodemailer from "nodemailer";
import dotenv from "dotenv";
import User from "../models/User";

dotenv.config();

// Create a transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: "gmail", // Gmail service
  auth: {
    user: process.env.GMAIL_USER, // Your Gmail email address
    pass: process.env.GMAIL_PASSWORD, // Your Gmail app password (not your Gmail account password)
  },
});

// In-memory store for OTPs (could be extended to use Redis or database for production)
let otpStore: Map<string, { otp: string; expiresAt: number }> = new Map();

// Function to generate a random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTPEmail = async (email: string, otp: string) => {
  const mailOptions = {
    from: process.env.GMAIL_USER, // Your Gmail email address
    to: email, // Recipient's email address
    subject: "Your OTP Verification Code", // Email subject
    html: `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f9;
              margin: 0;
              padding: 0;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 30px auto;
              background-color: #fff;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
              text-align: center;
            }
            .header {
              font-size: 24px;
              font-weight: bold;
              color: #4CAF50;
              margin-bottom: 20px;
            }
            .otp-code {
              font-size: 36px;
              font-weight: bold;
              color: #4CAF50;
              background-color: #f1f1f1;
              padding: 20px;
              border-radius: 6px;
              margin: 20px 0;
            }
            .footer {
              font-size: 14px;
              color: #888;
            }
            .footer a {
              color: #4CAF50;
              text-decoration: none;
            }
            .btn {
              background-color: #4CAF50;
              color: white;
              padding: 10px 20px;
              text-decoration: none;
              border-radius: 4px;
              margin-top: 20px;
              display: inline-block;
            }
            .btn:hover {
              background-color: #45a049;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              OTP Verification Code
            </div>
            <p>Hello,</p>
            <p>We received a request to verify your account. Use the following One-Time Password (OTP) to complete the process:</p>
            <div class="otp-code">
              ${otp}
            </div>
            <p>This OTP is valid for the next 10 minutes. If you didn't request this, please ignore this email.</p>
            <a href="#" class="btn">Verify Now</a>
            <div class="footer">
              <p>If you need assistance, visit our <a href="#">support page</a>.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    await saveOTP(email, otp); // Save OTP to the database
    console.log("OTP sent successfully:", info.response);
    return info;
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new Error("Failed to send OTP email");
  }
};

// Function to save OTP with expiration time (10 minutes)
const saveOTP = async (email: string, otp: string) => {
  const expiresAt = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes
  await User.findOneAndUpdate(
    { email },
    { otp, otpExpiresAt: new Date(expiresAt) },
    { new: true, upsert: true }
  );
};

// Function to get OTP from store
const getOTP = async (email: string) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }
  return {
    otp: user.otp,
    expiresAt: user.otpExpiresAt,
  };
};

export { generateOTP, sendOTPEmail, saveOTP, getOTP };
