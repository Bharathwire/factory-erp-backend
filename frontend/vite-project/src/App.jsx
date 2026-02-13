import { useState, useEffect } from "react";
import "./index.css";

const API_URL = "https://factory-erp-backend.onrender.com";

function App() {
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({
    customerName: "",
    product: "",
    gauge: "",
    size: "",
    quantity: "",
    status: "Pending"
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // 🔹 Fetch Orders
  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/orders`);
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // 🔹 Handle Input Change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🔹 Add Order
  const addOrder = async (e) => {
    e.preventDefault();

    await fetch(`${API_URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    fetchOrders();

    setForm({
      customerName: "",
      product: "",
      gauge: "",
      size: "",
      quantity: "",
      status: "Pending"
    });
  };

  // 🔹 Mark Complete
  const markComplete = async (id) => {
    await fetch(`${API_URL}/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Completed" })
    });

    fetchOrders();
  };

  // 🔹 Delete Order
  const deleteOrder = async (id) => {
    await fetch(`${API_URL}/orders/${id}`, {
      method: "DELETE"
    });

    fetchOrders();
  };

  // 🔹 Filters
  const filteredOrders = orders.filter(order =>
    order.customerName?.toLowerCase().includes(search.toLowerCase()) &&
    (statusFilter === "All" || order.status === statusFilter)
  );

  // 🔹 Summary
  const total = orders.length;
  const completed = orders.filter(o => o.status === "Completed").length;
  const pending = orders.filter(o => o.status === "Pending").length;

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <h1 className="text-4xl font-bold text-center text-blue-600 mb-6">
        Factory ERP Dashboard
      </h1>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white shadow rounded p-4 text-center">
          <h2 className="font-semibold">Total Orders</h2>
          <p className="text-2xl font-bold text-blue-600">{total}</p>
        </div>

        <div className="bg-white shadow rounded p-4 text-center">
          <h2 className="font-semibold">Completed</h2>
          <p className="text-2xl font-bold text-green-600">{completed}</p>
        </div>

        <div className="bg-white shadow rounded p-4 text-center">
          <h2 className="font-semibold">Pending</h2>
          <p className="text-2xl font-bold text-orange-500">{pending}</p>
        </div>
      </div>

      {/* ADD ORDER FORM */}
      <form
        onSubmit={addOrder}
        className="bg-white p-4 rounded shadow grid grid-cols-6 gap-3 mb-6"
      >
        <input
          name="customerName"
          placeholder="Customer"
          value={form.customerName}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />

        <input
          name="product"
          placeholder="Product"
          value={form.product}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />

        <input
          name="gauge"
          placeholder="Gauge"
          value={form.gauge}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />

        <input
          name="size"
          placeholder="Size"
          value={form.size}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />

        <input
          name="quantity"
          type="number"
          placeholder="Qty"
          value={form.quantity}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />

        <button
          type="submit"
          className="bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add Order
        </button>
      </form>

      {/* SEARCH + FILTER */}
      <div className="flex gap-4 mb-4">
        <input
          placeholder="Search Customer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded w-1/3"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border p-2 rounded"
        >
          <option>All</option>
          <option>Pending</option>
          <option>Completed</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full text-center">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="p-3">Customer</th>
              <th>Product</th>
              <th>Gauge</th>
              <th>Size</th>
              <th>Qty</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredOrders.map(order => (
              <tr key={order._id} className="border-b">
                <td className="p-2">{order.customerName}</td>
                <td>{order.product}</td>
                <td>{order.gauge}</td>
                <td>{order.size}</td>
                <td>{order.quantity}</td>

                <td>
                  <span className={`px-2 py-1 rounded text-white ${
                    order.status === "Completed"
                      ? "bg-green-500"
                      : "bg-orange-500"
                  }`}>
                    {order.status}
                  </span>
                </td>

                <td>
                  <button
                    onClick={() => markComplete(order._id)}
                    className="bg-green-600 text-white px-3 py-1 rounded mr-2 hover:bg-green-700"
                  >
                    Complete
                  </button>

                  <button
                    onClick={() => deleteOrder(order._id)}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}

export default App;
