require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.log("DB Connection Error ❌:", err));

// Order Schema
const orderSchema = new mongoose.Schema({
  customerName: String, 
  mobile: String, 
  city: String,
  orderType: String,
  acres: String,
  units: String,
  productType: String,
  amount: Number,
  status: { type: String, default: "Order placed" }
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);

// Email Transporter Config
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Your gmail
    pass: process.env.EMAIL_PASS  // Your 16-digit App Password
  }
});

// GET Orders
app.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST New Order (Optimized to prevent hanging)
app.post("/orders", async (req, res) => {
  try {
    // 1. Save to Database First
    const newOrder = new Order(req.body);
    const savedOrder = await newOrder.save();

    // 2. Respond to Frontend IMMEDIATELY (Spinner will stop)
    res.status(201).json(savedOrder);

    // 3. Attempt Email in the background (Non-blocking)
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: "support@srinsights.com", // <--- THE TARGET EMAIL
      subject: `New Order: ${savedOrder.customerName}`,
      text: `A new order worth ₹${savedOrder.amount} has been placed by ${savedOrder.customerName}.`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("⚠️ Background Email Failed:", error.message);
      } else {
        console.log("📧 Background Email Sent Successfully");
      }
    });

  } catch (error) {
    console.error("❌ Order Save Error:", error.message);
    res.status(500).json({ error: "Failed to save order" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server active on port ${PORT}`));