require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.log("DB Error:", err));

// UPDATED SCHEMA: Includes all fields from your screenshot
const orderSchema = new mongoose.Schema({
  customerName: String,
  mobile: String,
  address: String,
  pincode: String,
  state: String,
  city: String,
  orderType: String,
  acres: String,
  units: String,
  soilType: String,
  productType: String,
  material: String,
  dimension: String,
  deliveryDate: String,
  amount: { type: Number, default: 0 },
  status: { type: String, default: "Order placed" }
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

app.get("/orders", async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json(orders);
});

app.post("/orders", async (req, res) => {
  try {
    const savedOrder = await new Order(req.body).save();
    res.status(201).json(savedOrder);

    // Background Email
    transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: "support@srinsights.com",
      subject: `New Factory Order: ${savedOrder.customerName}`,
      text: `New order for ${savedOrder.productType} worth ₹${savedOrder.amount} received.`
    }).catch(e => console.log("Mail error ignored."));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// NEW DELETE ROUTE
app.delete("/orders/:id", async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: "Order Deleted" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Server on ${PORT}`));