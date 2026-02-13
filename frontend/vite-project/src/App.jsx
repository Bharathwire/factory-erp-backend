import { useEffect, useState } from "react";

const API = "https://factory-erp-backend.onrender.com";

function App() {
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({
    customerName: "",
    product: "",
    gauge: "",
    size: "",
    quantity: "",
    deliveryDate: "",
    status: "Pending",
    priority: "Normal"
  });

  // Fetch Orders
  const fetchOrders = () => {
    fetch(`${API}/orders`)
      .then(res => res.json())
      .then(data => setOrders(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Add Order
  const addOrder = (e) => {
    e.preventDefault();

    fetch(`${API}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    })
      .then(() => {
        fetchOrders();
        setForm({
          customerName: "",
          product: "",
          gauge: "",
          size: "",
          quantity: "",
          deliveryDate: "",
          status: "Pending",
          priority: "Normal"
        });
      })
      .catch(err => console.error(err));
  };

  // Update Status
  const updateStatus = (id) => {
    fetch(`${API}/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Completed" })
    }).then(() => fetchOrders());
  };

  // Delete Order
  const deleteOrder = (id) => {
    fetch(`${API}/orders/${id}`, {
      method: "DELETE"
    }).then(() => fetchOrders());
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Factory ERP Orders</h2>

      <form onSubmit={addOrder} style={{ marginBottom: "20px" }}>
        <input
          placeholder="Customer Name"
          value={form.customerName}
          onChange={(e) => setForm({ ...form, customerName: e.target.value })}
          required
        />
        <input
          placeholder="Product"
          value={form.product}
          onChange={(e) => setForm({ ...form, product: e.target.value })}
          required
        />
        <input
          placeholder="Gauge"
          value={form.gauge}
          onChange={(e) => setForm({ ...form, gauge: e.target.value })}
        />
        <input
          placeholder="Size"
          value={form.size}
          onChange={(e) => setForm({ ...form, size: e.target.value })}
        />
        <input
          type="number"
          placeholder="Quantity"
          value={form.quantity}
          onChange={(e) => setForm({ ...form, quantity: e.target.value })}
          required
        />
        <input
          type="date"
          value={form.deliveryDate}
          onChange={(e) => setForm({ ...form, deliveryDate: e.target.value })}
        />
        <button type="submit">Add Order</button>
      </form>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Product</th>
            <th>Qty</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order._id}>
              <td>{order.customerName}</td>
              <td>{order.product}</td>
              <td>{order.quantity}</td>
              <td>{order.status}</td>
              <td>
                <button onClick={() => updateStatus(order._id)}>
                  Complete
                </button>
                <button onClick={() => deleteOrder(order._id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
