const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

// MongoDB Connection
mongoose.connect("mongodb+srv://Support_db_user:KXxY6KDbWqCEOY7O@bharathwire.edatxd1.mongodb.net/factoryERP")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Schemas
const orderSchema = new mongoose.Schema({
  customerName: String,
  product: String,
  gauge: String,
  size: String,
  quantity: Number,
  deliveryDate: String,
  status: String,
  priority: String
});

const Order = mongoose.model("Order", orderSchema);

// Routes

app.get("/", (req, res) => {
  res.send("Factory ERP Backend is running 🚀");
});

app.post("/orders", async (req, res) => {
  const newOrder = new Order(req.body);
  await newOrder.save();
  res.json(newOrder);
});

app.get("/orders", async (req, res) => {
  const orders = await Order.find();
  res.json(orders);
});

app.put("/orders/:id", async (req, res) => {
  await Order.findByIdAndUpdate(req.params.id, req.body);
  res.send("Order updated");
});

app.delete("/orders/:id", async (req, res) => {
  await Order.findByIdAndDelete(req.params.id);
  res.send("Order deleted");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
