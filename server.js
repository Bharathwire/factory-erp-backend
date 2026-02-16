require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

/* -------------------- ENV CHECK -------------------- */

console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "Loaded ✅" : "Not Found ❌");
console.log("MONGO_URI:", process.env.MONGO_URI ? "Loaded ✅" : "Not Found ❌");

/* -------------------- MONGODB CONNECTION -------------------- */

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.log("Mongo Error:", err));

/* -------------------- ORDER SCHEMA -------------------- */

const orderSchema = new mongoose.Schema({
  customerName: String,
  product: String,
  gauge: String,
  size: String,
  quantity: Number,
  status: { type: String, default: "Pending" },
});

const Order = mongoose.model("Order", orderSchema);

/* -------------------- EMAIL CONFIG -------------------- */

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // IMPORTANT
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.log("❌ Email Server Error:", error);
  } else {
    console.log("📧 Email Server Ready ✅");
  }
});

/* -------------------- ROUTES -------------------- */

// GET ALL ORDERS
app.get("/orders", async (req, res) => {
  const orders = await Order.find();
  res.json(orders);
});

// CREATE ORDER + SEND EMAIL
app.post("/orders", async (req, res) => {
  console.log("📩 New order request received");
  console.log("Body:", req.body);

  try {
    const newOrder = new Order(req.body);
    const savedOrder = await newOrder.save();

    console.log("✅ Order Saved in Database");

    console.log("📧 Sending Email...");

    let info = await transporter.sendMail({
      from: `"Factory ERP" <${process.env.EMAIL_USER}>`,
      to: "support@srinsights.com",
      subject: "🚨 New Order Received",
      html: `
        <h3>New Order Details</h3>
        <p><b>Customer:</b> ${savedOrder.customerName}</p>
        <p><b>Product:</b> ${savedOrder.product}</p>
        <p><b>Gauge:</b> ${savedOrder.gauge}</p>
        <p><b>Size:</b> ${savedOrder.size}</p>
        <p><b>Quantity:</b> ${savedOrder.quantity}</p>
        <p><b>Status:</b> ${savedOrder.status}</p>
      `,
    });

    console.log("📧 Email Sent:", info.response);

    res.status(201).json(savedOrder);
  } catch (error) {
    console.log("❌ ERROR in /orders:", error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE ORDER
app.delete("/orders/:id", async (req, res) => {
  await Order.findByIdAndDelete(req.params.id);
  res.json({ message: "Order deleted" });
});

/* -------------------- SERVER -------------------- */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});
