import React, { useEffect, useState } from "react";
import "./Dashboard.css";

const API_URL = "http://localhost:5000"; // change to Render URL when deploying

const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    customerName: "",
    product: "",
    gauge: "",
    size: "",
    quantity: "",
  });

  /* ================= FETCH ORDERS ================= */
  const fetchOrders = async () => {
    const res = await fetch(`${API_URL}/orders`);
    const data = await res.json();
    setOrders(data);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  /* ================= HANDLE INPUT ================= */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /* ================= CREATE ORDER ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch(`${API_URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const newOrder = await res.json();

    setOrders([newOrder, ...orders]);
    setShowModal(false);

    setFormData({
      customerName: "",
      product: "",
      gauge: "",
      size: "",
      quantity: "",
    });
  };

  /* ================= COMPLETE ORDER ================= */
  const handleComplete = async (id) => {
    const res = await fetch(`${API_URL}/orders/${id}`, {
      method: "PUT",
    });

    const updatedOrder = await res.json();

    setOrders((prev) =>
      prev.map((order) =>
        order._id === id ? updatedOrder : order
      )
    );
  };

  /* ================= DELETE ORDER ================= */
  const handleDelete = async (id) => {
    await fetch(`${API_URL}/orders/${id}`, {
      method: "DELETE",
    });

    setOrders((prev) =>
      prev.filter((order) => order._id !== id)
    );
  };

  return (
    <div className="dashboard">
      <div className="overlay">
        <h1>Factory ERP Dashboard</h1>

        <button className="add-btn" onClick={() => setShowModal(true)}>
          + Add Order
        </button>

        <div className="orders-container">
          {orders.map((order) => (
            <div key={order._id} className="order-card">
              <h3>{order.customerName}</h3>
              <p>Product: {order.product}</p>
              <p>Gauge: {order.gauge}</p>
              <p>Size: {order.size}</p>
              <p>Quantity: {order.quantity}</p>
              <p>Status: {order.status}</p>

              <div className="btn-group">
                {order.status !== "Completed" && (
                  <button
                    className="complete-btn"
                    onClick={() => handleComplete(order._id)}
                  >
                    Complete
                  </button>
                )}

                <button
                  className="delete-btn"
                  onClick={() => handleDelete(order._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ================= MODAL ================= */}
        {showModal && (
          <div className="modal">
            <div className="modal-content">
              <h2>Add New Order</h2>
              <form onSubmit={handleSubmit}>
                <input
                  name="customerName"
                  placeholder="Customer Name"
                  value={formData.customerName}
                  onChange={handleChange}
                  required
                />
                <input
                  name="product"
                  placeholder="Product"
                  value={formData.product}
                  onChange={handleChange}
                  required
                />
                <input
                  name="gauge"
                  placeholder="Gauge"
                  value={formData.gauge}
                  onChange={handleChange}
                />
                <input
                  name="size"
                  placeholder="Size"
                  value={formData.size}
                  onChange={handleChange}
                />
                <input
                  name="quantity"
                  placeholder="Quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                />

                <button type="submit" className="submit-btn">
                  Submit
                </button>
              </form>

              <button
                className="close-btn"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
