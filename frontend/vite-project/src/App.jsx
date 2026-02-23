import React, { useEffect, useState } from "react";
import { 
  LayoutDashboard, ClipboardList, Users, FileText, 
  Plus, Package, X, Loader2, IndianRupee, LogOut 
} from "lucide-react";

// UPDATE THIS TO YOUR ACTUAL BACKEND URL
const API_URL = "https://factory-erp-backend.onrender.com";

function App() {
  const [view, setView] = useState("dashboard"); 
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
        fetchOrders();
        alert("Order Recorded!");
      }
    } catch (err) { alert("Server connection failed"); }
    finally { setLoading(false); } // STOPS LOADING SPINNER
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-10 text-blue-400">
          <Package size={28} />
          <h1 className="text-xl font-black tracking-tighter text-white">FACTORY ERP</h1>
        </div>
        <nav className="space-y-2 flex-1">
          <SidebarLink active={view === 'dashboard'} icon={<LayoutDashboard size={20}/>} label="Dashboard" onClick={() => setView('dashboard')} />
          <SidebarLink active={view === 'orders'} icon={<ClipboardList size={20}/>} label="Orders" onClick={() => setView('orders')} />
          <SidebarLink active={view === 'customers'} icon={<Users size={20}/>} label="Customers" onClick={() => setView('customers')} />
          <SidebarLink active={view === 'reports'} icon={<FileText size={20}/>} label="Reports" onClick={() => setView('reports')} />
        </nav>
        <button className="flex items-center gap-3 text-slate-500 hover:text-white p-3 mt-auto"><LogOut size={20}/> Logout</button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto p-10">
        <header className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-black capitalize">{view}</h2>
          <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition shadow-lg shadow-blue-200">
            <Plus size={20}/> New Order
          </button>
        </header>

        {view === "dashboard" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <StatBox label="Total Orders" value={orders.length} color="text-blue-600" />
              <StatBox label="Revenue" value={`₹${orders.reduce((s, o) => s + (Number(o.amount) || 0), 0).toLocaleString('en-IN')}`} color="text-green-600" />
              <StatBox label="Active Clients" value={[...new Set(orders.map(o => o.customerName))].length} color="text-purple-600" />
            </div>
            <OrderTable orders={orders.slice(0, 5)} title="Recent Activity" />
          </>
        )}

        {view === "orders" && <OrderTable orders={orders} title="Manufacturing History" />}

        {view === "customers" && (
          <div className="grid grid-cols-3 gap-4">
            {[...new Set(orders.map(o => o.customerName))].map((name, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl">{name[0]}</div>
                <p className="font-bold text-lg">{name}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-2xl p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold">New Order Entry</h3>
              <X className="cursor-pointer text-slate-400" onClick={() => setShowModal(false)} />
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <input className="border p-3 rounded-xl focus:ring-2 ring-blue-500 outline-none" placeholder="Customer Name" onChange={e => setFormData({...formData, customerName: e.target.value})} required />
              <input className="border p-3 rounded-xl focus:ring-2 ring-blue-500 outline-none" placeholder="Mobile" onChange={e => setFormData({...formData, mobile: e.target.value})} />
              <input className="border p-3 rounded-xl focus:ring-2 ring-blue-500 outline-none" placeholder="Product Type" onChange={e => setFormData({...formData, productType: e.target.value})} />
              <input className="border p-3 rounded-xl focus:ring-2 ring-blue-500 outline-none" placeholder="Amount (₹)" type="number" onChange={e => setFormData({...formData, amount: e.target.value})} required />
              <button disabled={loading} className="col-span-2 bg-blue-600 text-white py-4 rounded-2xl font-bold flex justify-center hover:bg-blue-700 transition">
                {loading ? <Loader2 className="animate-spin" /> : "Confirm Manufacturing Order"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const SidebarLink = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-900' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
    {icon} <span className="font-semibold">{label}</span>
  </button>
);

const StatBox = ({ label, value, color }) => (
  <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">{label}</p>
    <p className={`text-4xl font-black ${color}`}>{value}</p>
  </div>
);

const OrderTable = ({ orders, title }) => (
  <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
    <div className="p-6 border-b font-bold text-lg bg-slate-50/50">{title}</div>
    <table className="w-full text-left">
      <thead className="bg-slate-50 text-slate-400 text-xs uppercase font-bold tracking-wider">
        <tr><th className="p-6">Customer</th><th className="p-6">Product</th><th className="p-6 text-right">Amount</th></tr>
      </thead>
      <tbody className="divide-y divide-slate-50">
        {orders.map((o, i) => (
          <tr key={i} className="hover:bg-slate-50/80 transition">
            <td className="p-6 font-bold">{o.customerName}</td>
            <td className="p-6 text-slate-500 font-medium">{o.productType}</td>
            <td className="p-6 text-right font-black text-slate-900">₹{(Number(o.amount) || 0).toLocaleString('en-IN')}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default App;