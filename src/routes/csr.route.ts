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

// ✅ GET - Fetch all contact messages
contactRoute.get("/", async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: contacts });
  } catch (err) {
    console.error("Failed to fetch contact messages:", err);
    res
      .status(500)
      .json({ success: false, error: "Unable to fetch messages." });
  }
});

export default contactRoute;
