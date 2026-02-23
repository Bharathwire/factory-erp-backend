import React, { useEffect, useState } from "react";
import { 
  LayoutDashboard, ClipboardList, Users, FileText, 
  Plus, Package, X, Loader2, LogOut 
} from "lucide-react";

const API_URL = "https://factory-erp-backend.onrender.com";

function App() {
  const [view, setView] = useState("dashboard"); // Dashboard, Orders, or Customers
  const [orders, setOrders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "", mobile: "", city: "", orderType: "Direct Sales", 
    productType: "Chain Link", amount: ""
  });

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/orders`);
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) { console.error("Fetch Error:", err); }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setShowModal(false);
        fetchOrders(); // Refresh list
      }
    } catch (err) { alert("Server connection failed"); }
    finally { setLoading(false); } // This stops the spinner
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-10 text-blue-400">
          <Package size={28} />
          <h1 className="text-xl font-bold text-white tracking-tighter">FACTORY ERP</h1>
        </div>
        <nav className="space-y-2 flex-1">
          <button onClick={() => setView('dashboard')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${view === 'dashboard' ? 'bg-blue-600' : 'text-slate-400 hover:bg-slate-800'}`}>
            <LayoutDashboard size={20}/> Dashboard
          </button>
          <button onClick={() => setView('orders')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${view === 'orders' ? 'bg-blue-600' : 'text-slate-400 hover:bg-slate-800'}`}>
            <ClipboardList size={20}/> Orders
          </button>
          <button onClick={() => setView('customers')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${view === 'customers' ? 'bg-blue-600' : 'text-slate-400 hover:bg-slate-800'}`}>
            <Users size={20}/> Customers
          </button>
        </nav>
      </aside>

      {/* MAIN VIEW */}
      <main className="flex-1 overflow-y-auto p-10">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-black capitalize">{view}</h2>
          <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-200">
            <Plus size={20}/> New Order
          </button>
        </div>

        {view === "dashboard" && (
          <div className="grid grid-cols-3 gap-6 mb-10">
            <StatCard label="Total Orders" value={orders.length} />
            <StatCard label="Total Revenue" value={`₹${orders.reduce((s, o) => s + (Number(o.amount) || 0), 0).toLocaleString()}`} />
            <StatCard label="Clients" value={[...new Set(orders.map(o => o.customerName))].length} />
          </div>
        )}

        {view === "customers" ? (
          <div className="grid grid-cols-3 gap-4">
             {[...new Set(orders.map(o => o.customerName))].map((name, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl">{name[0]}</div>
                <p className="font-bold">{name}</p>
              </div>
            ))}
          </div>
        ) : (
          <OrderTable orders={view === "dashboard" ? orders.slice(0, 5) : orders} />
        )}
      </main>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-xl p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Register Order</h3>
              <X className="cursor-pointer" onClick={() => setShowModal(false)} />
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input className="w-full border p-3 rounded-xl" placeholder="Customer Name" onChange={e => setFormData({...formData, customerName: e.target.value})} required />
              <input className="w-full border p-3 rounded-xl" placeholder="Product Type" onChange={e => setFormData({...formData, productType: e.target.value})} />
              <input className="w-full border p-3 rounded-xl" placeholder="Amount (₹)" type="number" onChange={e => setFormData({...formData, amount: e.target.value})} required />
              <button disabled={loading} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold flex justify-center transition hover:bg-blue-700">
                {loading ? <Loader2 className="animate-spin" /> : "Save Order"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const StatCard = ({ label, value }) => (
  <div className="bg-white p-8 rounded-3xl border shadow-sm">
    <p className="text-slate-400 text-xs font-bold uppercase mb-1">{label}</p>
    <p className="text-3xl font-black">{value}</p>
  </div>
);

const OrderTable = ({ orders }) => (
  <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
    <table className="w-full text-left">
      <thead className="bg-slate-50 border-b">
        <tr><th className="p-4">Customer</th><th className="p-4">Product</th><th className="p-4 text-right">Amount</th></tr>
      </thead>
      <tbody>
        {orders.map((o, i) => (
          <tr key={i} className="border-b hover:bg-slate-50 transition">
            <td className="p-4 font-bold">{o.customerName}</td>
            <td className="p-4 text-slate-500">{o.productType}</td>
            <td className="p-4 text-right font-bold">₹{(Number(o.amount) || 0).toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default App;