require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

// Database Connection using Render Environment Variable
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.log("DB Connection Error ❌:", err));

// Complete Schema to match your form fields
const orderSchema = new mongoose.Schema({
  customerName: String, mobile: String, city: String, pincode: String,
  orderType: String, acres: String, units: String, soilType: String,
  productType: String, material: String, dimension: String,
  deliveryDate: String, amount: { type: Number, default: 0 },
  status: { type: String, default: "Order placed" }
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);

// Email Config using Render Environment Variables
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS 
  }
});

// GET all orders
app.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST new order - NON-BLOCKING EMAIL
app.post("/orders", async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    const savedOrder = await newOrder.save();

    // 1. Respond to Frontend IMMEDIATELY to stop the loading spinner
    res.status(201).json(savedOrder);

    // 2. Send Email in the background
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: "support@srinsights.com",
      subject: `New Factory Order: ${savedOrder.customerName}`,
      text: `Order Details:\nCustomer: ${savedOrder.customerName}\nProduct: ${savedOrder.productType}\nAmount: ₹${savedOrder.amount}`
    };

    transporter.sendMail(mailOptions, (err) => {
      if (err) console.log("📧 Email Background Error:", err.message);
      else console.log("📧 Alert Sent Successfully");
    });

  } catch (err) {
    console.error("❌ Save Error:", err.message);
    res.status(500).json({ error: "Failed to save order" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));