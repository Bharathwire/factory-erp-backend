const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

// 🔹 Connect MongoDB
mongoose.connect("mongodb+srv://Support_db_user:KXxY6KDbWqCEOY7O@bharathwire.edatxd1.mongodb.net/?appName=BharathWire")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// 🔹 Customer Schema
const customerSchema = new mongoose.Schema({
  name: String,
  place: String,
  mobile: String
});

const Customer = mongoose.model("Customer", customerSchema);

// 🔹 Order Schema
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

// -------------------
// CUSTOMER ROUTES
// -------------------

app.post("/customers", async (req, res) => {
  const newCustomer = new Customer(req.body);
  await newCustomer.save();
  res.send("Customer added");
});

app.get("/customers", async (req, res) => {
  const customers = await Customer.find();
  res.json(customers);
});

// -------------------
// ORDER ROUTES
// -------------------

app.post("/orders", async (req, res) => {
  const newOrder = new Order(req.body);
  await newOrder.save();
  res.send("Order added");
});

app.get("/orders", async (req, res) => {
  const orders = await Order.find();
  res.json(orders);
});

// 🔹 Update Order Status
app.put("/orders/:id", async (req, res) => {
  await Order.findByIdAndUpdate(req.params.id, req.body);
  res.send("Order updated");
});

// 🔹 Delete Order
app.delete("/orders/:id", async (req, res) => {
  await Order.findByIdAndDelete(req.params.id);
  res.send("Order deleted");
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});

app.get("/orders/:id", async (req, res) => {
  const order = await Order.findById(req.params.id);
  res.json(order);
});


