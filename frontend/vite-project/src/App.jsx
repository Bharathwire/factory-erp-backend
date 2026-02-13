import { useState, useEffect } from "react";

const API_URL = "https://factory-erp-backend.onrender.com";

function App() {
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({
    customer: "",
    product: "",
    gauge: "",
    size: "",
    quantity: "",
  });

  useEffect(() => {
    fetch(`${API_URL}/orders`)
      .then(res => res.json())
      .then(data => setOrders(data))
      .catch(err => console.log(err));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addOrder = async () => {
    const res = await fetch(`${API_URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setOrders([...orders, data]);
  };

  return (
    <div style={{ padding: "30px", fontFamily: "Arial" }}>
      <h1 style={{ color: "#2c3e50" }}>Factory ERP Orders</h1>

      <div style={{ marginBottom: "20px" }}>
        <input name="customer" placeholder="Customer Name" onChange={handleChange} />
        <input name="product" placeholder="Product" onChange={handleChange} />
        <input name="gauge" placeholder="Gauge" onChange={handleChange} />
        <input name="size" placeholder="Size" onChange={handleChange} />
        <input name="quantity" placeholder="Quantity" onChange={handleChange} />
        <button onClick={addOrder} style={{
          background: "#3498db",
          color: "white",
          padding: "8px 15px",
          border: "none",
          marginLeft: "10px"
        }}>
          Add Order
        </button>
      </div>

      <table border="1" cellPadding="10" style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead style={{ background: "#3498db", color: "white" }}>
          <tr>
            <th>Customer</th>
            <th>Product</th>
            <th>Gauge</th>
            <th>Size</th>
            <th>Qty</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o, index) => (
            <tr key={index}>
              <td>{o.customer}</td>
              <td>{o.product}</td>
              <td>{o.gauge}</td>
              <td>{o.size}</td>
              <td>{o.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
