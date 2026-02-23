import React, { useEffect, useState } from "react";
import { 
  LayoutDashboard, ClipboardList, Users, FileText, 
  Plus, Package, X, Loader2, Search 
} from "lucide-react";

const API_URL = "https://factory-erp-backend.onrender.com";

function App() {
  const [view, setView] = useState("dashboard"); // Controls which screen is shown
  const [orders, setOrders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "", mobile: "", city: "", orderType: "Direct Sales", 
    acres: "", units: "", productType: "", amount: ""
  });

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/orders`);
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) { console.error("Fetch error:", err); }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setShowModal(false);
        fetchOrders(); // Refresh list
        alert("Order Saved Successfully!");
      }
    } catch (err) {
      alert("Network error. Please check backend.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-10">
          <Package className="text-blue-400" />
          <h1 className="text-xl font-bold">Factory ERP</h1>
        </div>
        <nav className="space-y-4 flex-1">
          <NavItem active={view === "dashboard"} onClick={() => setView("dashboard")} icon={<LayoutDashboard size={20}/>} label="Dashboard" />
          <NavItem active={view === "orders"} onClick={() => setView("orders")} icon={<ClipboardList size={20}/>} label="Orders" />
          <NavItem active={view === "customers"} onClick={() => setView("customers")} icon={<Users size={20}/>} label="Customers" />
          <NavItem active={view === "reports"} onClick={() => setView("reports")} icon={<FileText size={20}/>} label="Reports" />
        </nav>
      </aside>

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold capitalize">{view} View</h2>
          <button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition shadow-lg shadow-blue-200">
            <Plus size={20}/> New Order
          </button>
        </div>

        {/* Dynamic View Logic */}
        {view === "dashboard" && <DashboardGrid orders={orders} />}
        {view === "orders" && <OrderTable orders={orders} />}
        {view === "customers" && <CustomerList orders={orders} />}
        {view === "reports" && <div className="p-20 text-center text-slate-400 border-2 border-dashed rounded-xl">Reports coming soon...</div>}
      </main>

      {/* Modal with fixed loading state */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-8 shadow-2xl">
            <div className="flex justify-between mb-6">
              <h3 className="text-xl font-bold">New Manufacturing Order</h3>
              <X className="cursor-pointer text-slate-400 hover:text-slate-600" onClick={() => setShowModal(false)} />
            </div>
            <form onSubmit={handleCreateOrder} className="grid grid-cols-2 gap-4">
              <input className="border p-2 rounded" placeholder="Customer Name" onChange={e => setFormData({...formData, customerName: e.target.value})} required />
              <input className="border p-2 rounded" placeholder="Mobile" onChange={e => setFormData({...formData, mobile: e.target.value})} />
              <input className="border p-2 rounded" placeholder="City" onChange={e => setFormData({...formData, city: e.target.value})} />
              <input className="border p-2 rounded" placeholder="Product Type" onChange={e => setFormData({...formData, productType: e.target.value})} />
              <input className="border p-2 rounded" placeholder="Total Amount" type="number" onChange={e => setFormData({...formData, amount: e.target.value})} required />
              <button disabled={submitting} className="col-span-2 bg-blue-600 text-white py-3 rounded-lg font-bold flex justify-center hover:bg-blue-700">
                {submitting ? <Loader2 className="animate-spin" /> : "Confirm Order"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Support Components
const NavItem = ({ icon, label, active, onClick }) => (
  <div onClick={onClick} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${active ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
    {icon} <span>{label}</span>
  </div>
);

const DashboardGrid = ({ orders }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div className="bg-white p-6 rounded-2xl border shadow-sm">
      <p className="text-slate-400 text-sm font-bold uppercase mb-1">Total Orders</p>
      <p className="text-3xl font-black">{orders.length}</p>
    </div>
    <div className="bg-white p-6 rounded-2xl border shadow-sm border-l-4 border-l-green-500">
      <p className="text-slate-400 text-sm font-bold uppercase mb-1">Total Revenue</p>
      <p className="text-3xl font-black">₹{orders.reduce((sum, o) => sum + (Number(o.amount) || 0), 0).toLocaleString()}</p>
    </div>
    <div className="bg-white p-6 rounded-2xl border shadow-sm">
      <p className="text-slate-400 text-sm font-bold uppercase mb-1">Active Clients</p>
      <p className="text-3xl font-black">{[...new Set(orders.map(o => o.customerName))].length}</p>
    </div>
  </div>
);

const OrderTable = ({ orders }) => (
  <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
    <table className="w-full text-left">
      <thead className="bg-slate-50 border-b text-xs uppercase text-slate-500 font-bold">
        <tr><th className="p-4">Customer</th><th className="p-4">Product</th><th className="p-4">Status</th><th className="p-4 text-right">Amount</th></tr>
      </thead>
      <tbody>
        {orders.map((o, i) => (
          <tr key={i} className="border-b hover:bg-slate-50">
            <td className="p-4 font-bold">{o.customerName}</td>
            <td className="p-4">{o.productType}</td>
            <td className="p-4"><span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase">{o.status}</span></td>
            <td className="p-4 text-right font-bold">₹{Number(o.amount || 0).toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const CustomerList = ({ orders }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {[...new Set(orders.map(o => o.customerName))].map((name, i) => (
      <div key={i} className="bg-white p-4 rounded-xl border flex items-center gap-4">
        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">{name[0]}</div>
        <p className="font-bold">{name}</p>
      </div>
    ))}
  </div>
);

export default App;