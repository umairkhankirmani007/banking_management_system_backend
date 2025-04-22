import express from "express";
import Contact from "../models/SupportForm.model";

const contactRoute = express.Router();

contactRoute.post("/", async (req: any, res: any) => {
  try {
    const { email, subject, message } = req.body;

    if (!email || !subject || !message) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const newContact = new Contact({
      email,
      subject,
      message,
    });

    await newContact.save();

    res
      .status(201)
      .json({ message: "Contact message submitted successfully." });
  } catch (err) {
    console.error("Contact form error:", err);
    res.status(500).json({ error: "Something went wrong." });
  }
});

export default contactRoute;
