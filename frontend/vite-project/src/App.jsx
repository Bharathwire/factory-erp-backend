import React, { useEffect, useState } from "react";
import { 
  LayoutDashboard, ClipboardList, Users, Trash2, 
  Plus, Package, X, Loader2, IndianRupee 
} from "lucide-react";

const API_URL = "https://factory-erp-backend.onrender.com";

function App() {
  const [view, setView] = useState("dashboard");
  const [orders, setOrders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "", mobile: "", address: "", pincode: "", state: "", city: "",
    orderType: "Direct Sales", acres: "", units: "", soilType: "Normal Soil",
    productType: "", material: "", dimension: "", deliveryDate: "", amount: ""
  });

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/orders`);
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      setShowModal(false);
      fetchOrders();
    } catch (err) { alert("Error saving order"); }
    finally { setLoading(false); }
  };

  const deleteOrder = async (id) => {
    if (!window.confirm("Delete this order?")) return;
    try {
      await fetch(`${API_URL}/orders/${id}`, { method: "DELETE" });
      fetchOrders();
    } catch (err) { alert("Delete failed"); }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-10"><Package className="text-blue-400" /><h1 className="font-bold uppercase tracking-tighter">FACTORY ERP</h1></div>
        <nav className="space-y-2 flex-1">
          <button onClick={() => setView('dashboard')} className={`w-full flex items-center gap-3 p-3 rounded-xl ${view === 'dashboard' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}><LayoutDashboard size={20}/> Dashboard</button>
          <button onClick={() => setView('orders')} className={`w-full flex items-center gap-3 p-3 rounded-xl ${view === 'orders' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}><ClipboardList size={20}/> Orders</button>
          <button onClick={() => setView('customers')} className={`w-full flex items-center gap-3 p-3 rounded-xl ${view === 'customers' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}><Users size={20}/> Customers</button>
        </nav>
      </aside>

      {/* MAIN */}
      <main className="flex-1 overflow-y-auto p-10">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-black capitalize">{view}</h2>
          <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 shadow-lg">
            <Plus size={20}/> New Order
          </button>
        </div>

        {view === "dashboard" && (
          <div className="grid grid-cols-3 gap-6 mb-10">
            <StatCard label="Orders" value={orders.length} />
            <StatCard label="Revenue" value={`₹${orders.reduce((s, o) => s + (Number(o.amount) || 0), 0).toLocaleString()}`} />
            <StatCard label="Clients" value={[...new Set(orders.map(o => o.customerName))].length} />
          </div>
        )}

        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b text-xs uppercase text-slate-400 font-bold">
              <tr><th className="p-4">Customer</th><th className="p-4">Product</th><th className="p-4 text-right">Amount</th><th className="p-4">Actions</th></tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id} className="border-b hover:bg-slate-50">
                  <td className="p-4 font-bold">{o.customerName}</td>
                  <td className="p-4">{o.productType}</td>
                  <td className="p-4 text-right font-black">₹{(Number(o.amount) || 0).toLocaleString()}</td>
                  <td className="p-4"><Trash2 className="text-red-400 cursor-pointer hover:text-red-600" size={18} onClick={() => deleteOrder(o._id)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* DETAILED MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-4xl p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between mb-8"><h3 className="text-2xl font-bold">Comprehensive Order Entry</h3><X className="cursor-pointer" onClick={() => setShowModal(false)} /></div>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-4">
              <div className="space-y-4">
                <p className="font-bold text-blue-600 text-xs">CUSTOMER DETAILS</p>
                <Input placeholder="Name" onChange={e => setFormData({...formData, customerName: e.target.value})} required />
                <Input placeholder="Mobile" onChange={e => setFormData({...formData, mobile: e.target.value})} />
                <Input placeholder="Address" onChange={e => setFormData({...formData, address: e.target.value})} />
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="City" onChange={e => setFormData({...formData, city: e.target.value})} />
                  <Input placeholder="Pincode" onChange={e => setFormData({...formData, pincode: e.target.value})} />
                </div>
              </div>

              <div className="space-y-4">
                <p className="font-bold text-blue-600 text-xs">ORDER SPECS</p>
                <select className="w-full border p-2 rounded-lg bg-white" onChange={e => setFormData({...formData, orderType: e.target.value})}>
                  <option>Direct Sales</option><option>Fencing Contract</option>
                </select>
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Acres" onChange={e => setFormData({...formData, acres: e.target.value})} />
                  <Input placeholder="Units" onChange={e => setFormData({...formData, units: e.target.value})} />
                </div>
                <Input placeholder="Soil Type" onChange={e => setFormData({...formData, soilType: e.target.value})} />
              </div>

              <div className="space-y-4">
                <p className="font-bold text-blue-600 text-xs">PRODUCT & PRICING</p>
                <Input placeholder="Product (e.g. Chain Link)" onChange={e => setFormData({...formData, productType: e.target.value})} required />
                <Input placeholder="Material" onChange={e => setFormData({...formData, material: e.target.value})} />
                <Input placeholder="Amount (₹)" type="number" onChange={e => setFormData({...formData, amount: e.target.value})} required />
                <Input type="date" onChange={e => setFormData({...formData, deliveryDate: e.target.value})} />
              </div>

              <button disabled={loading} className="col-span-3 bg-blue-600 text-white py-4 rounded-2xl font-bold flex justify-center hover:bg-blue-700 transition">
                {loading ? <Loader2 className="animate-spin" /> : "Finalize Factory Order"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const Input = (props) => <input {...props} className="w-full border p-2 rounded-lg focus:ring-2 ring-blue-500 outline-none" />;
const StatCard = ({ label, value }) => (
  <div className="bg-white p-6 rounded-2xl border shadow-sm text-center">
    <p className="text-slate-400 text-xs font-bold uppercase mb-1">{label}</p>
    <p className="text-3xl font-black">{value}</p>
  </div>
);

export default App;