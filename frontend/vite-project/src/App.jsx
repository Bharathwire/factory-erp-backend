import { useEffect, useState } from "react";

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
    priority: "Medium"
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  const fetchOrders = () => {
    fetch("http://localhost:5000/orders")
      .then(res => res.json())
      .then(data => setOrders(data));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addOrder = (e) => {
    e.preventDefault();
    fetch("http://localhost:5000/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    }).then(() => {
      fetchOrders();
      setForm({
        customerName: "",
        product: "",
        gauge: "",
        size: "",
        quantity: "",
        deliveryDate: "",
        status: "Pending",
        priority: "Medium"
      });
    });
  };

  const updateStatus = (id) => {
    fetch(`http://localhost:5000/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Completed" })
    }).then(() => fetchOrders());
  };

  const deleteOrder = (id) => {
    fetch(`http://localhost:5000/orders/${id}`, {
      method: "DELETE"
    }).then(() => fetchOrders());
  };

  const filteredOrders = orders.filter(order => {
    return (
      order.customerName.toLowerCase().includes(search.toLowerCase()) &&
      (statusFilter === "All" || order.status === statusFilter) &&
      (priorityFilter === "All" || order.priority === priorityFilter)
    );
  });

  const total = orders.length;
  const completed = orders.filter(o => o.status === "Completed").length;
  const pending = orders.filter(o => o.status === "Pending").length;
  const highPriority = orders.filter(o => o.priority === "High").length;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">
        Factory ERP Dashboard
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow text-center">
          <h2 className="text-lg font-semibold">Total Orders</h2>
          <p className="text-2xl font-bold text-blue-600">{total}</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow text-center">
          <h2 className="text-lg font-semibold">Completed</h2>
          <p className="text-2xl font-bold text-green-600">{completed}</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow text-center">
          <h2 className="text-lg font-semibold">Pending</h2>
          <p className="text-2xl font-bold text-orange-500">{pending}</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow text-center">
          <h2 className="text-lg font-semibold">High Priority</h2>
          <p className="text-2xl font-bold text-red-600">{highPriority}</p>
        </div>
      </div>

      {/* Add Order Form */}
      <form
        onSubmit={addOrder}
        className="bg-white p-4 rounded-xl shadow mb-6 grid grid-cols-4 gap-3"
      >
        <input name="customerName" placeholder="Customer"
          value={form.customerName} onChange={handleChange}
          className="border p-2 rounded" required />

        <input name="product" placeholder="Product"
          value={form.product} onChange={handleChange}
          className="border p-2 rounded" required />

        <input name="gauge" placeholder="Gauge"
          value={form.gauge} onChange={handleChange}
          className="border p-2 rounded" required />

        <input name="size" placeholder="Size"
          value={form.size} onChange={handleChange}
          className="border p-2 rounded" required />

        <input name="quantity" type="number" placeholder="Quantity"
          value={form.quantity} onChange={handleChange}
          className="border p-2 rounded" required />

        <input name="deliveryDate" type="date"
          value={form.deliveryDate} onChange={handleChange}
          className="border p-2 rounded" required />

        <select name="priority"
          value={form.priority} onChange={handleChange}
          className="border p-2 rounded">
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>

        <button type="submit"
          className="bg-blue-600 text-white rounded p-2 hover:bg-blue-700">
          Add Order
        </button>
      </form>

      {/* Search & Filters */}
      <div className="flex gap-3 mb-4">
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

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="border p-2 rounded"
        >
          <option>All</option>
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-center">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="p-3">Customer</th>
              <th>Product</th>
              <th>Gauge</th>
              <th>Size</th>
              <th>Qty</th>
              <th>Status</th>
              <th>Priority</th>
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
                  <span className={`px-2 py-1 rounded text-white ${
                    order.priority === "High"
                      ? "bg-red-500"
                      : order.priority === "Medium"
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }`}>
                    {order.priority}
                  </span>
                </td>

                <td>
                  <button
                    onClick={() => updateStatus(order._id)}
                    className="bg-green-600 text-white px-3 py-1 rounded mr-2 hover:bg-green-700"
                  >
                    Mark Completed
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
