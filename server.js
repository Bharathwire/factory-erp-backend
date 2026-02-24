require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

// DATABASE CONNECTION
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.log("DB Connection Error ❌:", err));

// 1. ORDER SCHEMA
const orderSchema = new mongoose.Schema({
  customerName: String, mobile: String, city: String, productType: String,
  amount: { type: Number, default: 0 },
  status: { type: String, default: "Pending" }
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);

// 2. STOCK SCHEMA
const stockSchema = new mongoose.Schema({
  itemName: String,
  quantity: Number,
  unit: String,
  lastUpdated: { type: Date, default: Date.now }
});

const Stock = mongoose.model("Stock", stockSchema);

// --- ROUTES FOR ORDERS ---

app.get("/orders", async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json(orders);
});

app.post("/orders", async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.patch("/orders/:id", async (req, res) => {
  try {
    const updated = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json(updated);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete("/orders/:id", async (req, res) => {
  await Order.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

// --- ROUTES FOR STOCK ---

app.get("/stock", async (req, res) => {
  const inventory = await Stock.find().sort({ itemName: 1 });
  res.json(inventory);
});

app.post("/stock", async (req, res) => {
  const { itemName, quantity, unit } = req.body;
  const item = await Stock.findOneAndUpdate(
    { itemName },
    { $set: { quantity, unit, lastUpdated: Date.now() } },
    { upsert: true, new: true }
  );
  res.json(item);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Factory Server running on ${PORT}`));