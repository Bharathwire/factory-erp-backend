console.log("🚀 RENDER VERSION ACTIVE");

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");

const app = express();
app.use(cors());
app.use(express.json());

/* -------------------- DEBUG ENV CHECK -------------------- */

console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "Loaded ✅" : "Missing ❌");
console.log("MONGO_URI:", process.env.MONGO_URI ? "Loaded ✅" : "Missing ❌");

/* -------------------- MONGODB CONNECTION -------------------- */

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch(err => console.log("Mongo Error:", err));

/* -------------------- EMAIL SETUP -------------------- */

const transporter = nodemailer.createTransport({  
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

transporter.verify(function (error, success) {
  if (error) {
    console.log("❌ Email Server Error:", error);
  } else {
    console.log("📧 Email Server Ready ✅");
  }
});

/* -------------------- SCHEMAS -------------------- */

const customerSchema = new mongoose.Schema({
  name: String,
  place: String,
  mobile: String
});

const Customer = mongoose.model("Customer", customerSchema);

const orderSchema = new mongoose.Schema({
  customerName: String,
  product: String,
  gauge: String,
  size: String,
  quantity: Number,
  deliveryDate: String,
  status: { type: String, default: "Pending" },
  priority: { type: String, default: "Medium" }
});

const Order = mongoose.model("Order", orderSchema);

/* -------------------- CUSTOMER ROUTES -------------------- */

app.post("/customers", async (req, res) => {
  const newCustomer = new Customer(req.body);
  await newCustomer.save();
  res.json(newCustomer);
});

app.get("/customers", async (req, res) => {
  const customers = await Customer.find();
  res.json(customers);
});

/* -------------------- ORDER ROUTES -------------------- */

// ✅ CREATE ORDER + SEND EMAIL
app.post("/orders", async (req, res) => {
  try {
    console.log("📩 New order request received");
    console.log("Body:", req.body);

    const newOrder = new Order(req.body);
    const savedOrder = await newOrder.save();

    console.log("✅ Order Saved in Database");

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: "support@srinsights.com", // Change if needed
      subject: "🚨 New Factory Order Received",
      text: `
New Order Details:

Customer: ${savedOrder.customerName}
Product: ${savedOrder.product}
Gauge: ${savedOrder.gauge}
Size: ${savedOrder.size}
Quantity: ${savedOrder.quantity}
Delivery Date: ${savedOrder.deliveryDate}
Status: ${savedOrder.status}
Priority: ${savedOrder.priority}
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("📧 Email Sent Successfully:", info.response);

    res.status(201).json(savedOrder);

  } catch (error) {
    console.error("❌ ERROR:", error);
    res.status(500).json({ error: "Order creation failed" });
  }
});

// GET ALL ORDERS
app.get("/orders", async (req, res) => {
  const orders = await Order.find();
  res.json(orders);
});

// UPDATE ORDER
app.put("/orders/:id", async (req, res) => {
  await Order.findByIdAndUpdate(req.params.id, req.body);
  res.send("Order updated");
});

// DELETE ORDER
app.delete("/orders/:id", async (req, res) => {
  await Order.findByIdAndDelete(req.params.id);
  res.send("Order deleted");
});

// ROOT ROUTE
app.get("/", (req, res) => {
  res.send("Factory ERP Backend is running 🚀");
});

/* -------------------- START SERVER -------------------- */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});
