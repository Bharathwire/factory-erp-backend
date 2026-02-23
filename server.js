require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");

const app = express();

/* ============================================================
   MIDDLEWARE & CORS
============================================================ */
// "origin: *" allows your Vite frontend on Render to access this API
app.use(cors({ origin: "*" }));
app.use(express.json());

/* ============================================================
   MONGODB CONNECTION
============================================================ */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.log("Mongo Connection Error ❌:", err));

/* ============================================================
   UPDATED ORDER SCHEMA (Matching Professional Dashboard)
============================================================ */
const orderSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true },
    mobile: String,
    address: String,
    pincode: String,
    state: String,
    city: String,
    country: String,
    orderType: String,
    acres: String,
    units: String,
    soilType: String,
    productType: String,
    material: String,
    dimension: String,
    deliveryDate: String,
    amount: { type: Number, default: 0 },
    status: { type: String, default: "Order placed" },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

/* ============================================================
   EMAIL CONFIGURATION (Nodemailer)
============================================================ */
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Verify email connection
transporter.verify((error) => {
  if (error) {
    console.log("Email Server Error ❌:", error);
  } else {
    console.log("Email Server Ready 📧✅");
  }
});

/* ============================================================
   API ROUTES
============================================================ */

/* --- 1. GET ALL ORDERS --- */
app.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* --- 2. CREATE NEW ORDER + EMAIL NOTIFICATION --- */
app.post("/orders", async (req, res) => {
  console.log("📩 New Order Incoming:", req.body.customerName);

  try {
    const newOrder = new Order(req.body);
    const savedOrder = await newOrder.save();

    // Send Professional HTML Email
    const mailOptions = {
      from: `"Factory ERP System" <${process.env.EMAIL_USER}>`,
      to: "support@srinsights.com",
      subject: `📦 NEW ORDER: ${savedOrder.customerName} | ${savedOrder.productType}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <div style="background-color: #1e293b; color: #ffffff; padding: 24px; text-align: center;">
            <h2 style="margin: 0; letter-spacing: 1px;">New Manufacturing Order</h2>
          </div>
          
          <div style="padding: 24px; background-color: #ffffff;">
            <p style="color: #64748b; font-size: 14px; margin-bottom: 20px;">A new order has been submitted via the Factory ERP Dashboard. Details are below:</p>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #94a3b8; font-size: 12px; text-transform: uppercase; font-weight: bold;">Customer Name</td>
                <td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${savedOrder.customerName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #94a3b8; font-size: 12px; text-transform: uppercase; font-weight: bold;">Contact</td>
                <td style="padding: 8px 0; color: #1e293b;">${savedOrder.mobile}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #94a3b8; font-size: 12px; text-transform: uppercase; font-weight: bold;">Location</td>
                <td style="padding: 8px 0; color: #1e293b;">${savedOrder.city}, ${savedOrder.state}</td>
              </tr>
              <tr><td colspan="2" style="border-bottom: 1px solid #f1f5f9; padding: 10px 0;"></td></tr>
              <tr>
                <td style="padding: 8px 0; color: #94a3b8; font-size: 12px; text-transform: uppercase; font-weight: bold;">Product Type</td>
                <td style="padding: 8px 0; color: #2563eb; font-weight: bold;">${savedOrder.productType}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #94a3b8; font-size: 12px; text-transform: uppercase; font-weight: bold;">Specs</td>
                <td style="padding: 8px 0; color: #1e293b;">${savedOrder.material} | ${savedOrder.dimension}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #94a3b8; font-size: 12px; text-transform: uppercase; font-weight: bold;">Order Qty</td>
                <td style="padding: 8px 0; color: #1e293b;">${savedOrder.acres} Acres / ${savedOrder.units} Units</td>
              </tr>
            </table>

            <div style="margin-top: 24px; padding: 16px; background-color: #f8fafc; border-radius: 8px; text-align: right;">
              <span style="display: block; color: #64748b; font-size: 12px;">TOTAL QUOTATION</span>
              <span style="font-size: 20px; font-weight: 800; color: #0f172a;">₹${savedOrder.amount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div style="background-color: #f1f5f9; color: #94a3b8; padding: 16px; text-align: center; font-size: 11px;">
            This is an automated message from your Factory ERP System.