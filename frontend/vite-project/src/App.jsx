import React, { useEffect, useState } from "react";
import { 
  LayoutDashboard, ClipboardList, Users, Trash2, Search, Filter, 
  Download, Plus, Package, X, Loader2, TrendingUp, Calendar, Globe, 
  Database, MessageSquare, Printer, MapPin, LogOut, Lock
} from "lucide-react";

const API_URL = "https://factory-erp-backend.onrender.com";
const MANAGER_PHONE = "+918825737191";

function App() {
  // --- AUTH STATE ---
  const [user, setUser] = useState(null); // Stores 'Admin' or 'Local'
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");

  const [view, setView] = useState("dashboard");
  const [orders, setOrders] = useState([]);
  const [stock, setStock] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const [formData, setFormData] = useState({
    customerName: "", mobile: "", city: "", productType: "", amount: "", status: "Pending"
  });

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/orders`);
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
  };

  const fetchStock = async () => {
    try {
      const res = await fetch(`${API_URL}/stock`);
      const data = await res.json();
      setStock(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { 
    if (user) {
      fetchOrders(); 
      fetchStock();
    }
  }, [user]);

  // --- LOGIN LOGIC ---
  const handleLogin = (e) => {
    e.preventDefault();
    if (loginData.username === "Admin" && loginData.password === "Bharathwire@2026") {
      setUser("Admin");
    } else if (loginData.username === "Local user" && loginData.password === "123") {
      setUser("Local");
    } else {
      setLoginError("Invalid Username or Password");
    }
  };

  // --- AUTO-WHATSAPP TO MANAGER ---
  const notifyManager = (order) => {
    const msg = `🚀 *New Order Received*\n\n*Customer:* ${order.customerName}\n*Product:* ${order.productType}\n*Amount:* ₹${order.amount}\n*Mobile:* ${order.mobile}\n\n_Sent via Bharath Wire ERP_`;
    window.open(`https://wa.me/${MANAGER_PHONE}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`${API_URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    const savedOrder = await res.json();
    setShowModal(false);
    fetchOrders();
    setLoading(false);
    
    // Trigger WhatsApp to Manager
    notifyManager(savedOrder);
  };

  // --- OTHER ACTIONS ---
  const updateStatus = async (id, status) => {
    await fetch(`${API_URL}/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchOrders();
  };

  const deleteOrder = async (id) => {
    if (user !== "Admin") return alert("Permission Denied! Only Admin can delete.");
    if (window.confirm("Delete order?")) {
      await fetch(`${API_URL}/orders/${id}`, { method: "DELETE" });
      fetchOrders();
    }
  };

  // --- LOGIN PAGE RENDER ---
  if (!user) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-900">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md animate-in zoom-in duration-300">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="text-white" size={30} />
            </div>
            <h1 className="text-2xl font-black">BHARATH WIRE</h1>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">ERP Login</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input className="w-full border p-4 rounded-2xl outline-none focus:ring-2 ring-blue-500" placeholder="Username" onChange={e => setLoginData({...loginData, username: e.target.value})} required />
            <input className="w-full border p-4 rounded-2xl outline-none focus:ring-2 ring-blue-500" type="password" placeholder="Password" onChange={e => setLoginData({...loginData, password: e.target.value})} required />
            {loginError && <p className="text-red-500 text-xs font-bold text-center">{loginError}</p>}
            <button className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-blue-700 transition">Sign In</button>
          </form>
        </div>
      </div>
    );
  }

  // --- ERP DASHBOARD RENDER ---
  return (
    <div className="flex h-screen bg-slate-100 font-sans text-slate-900">
      <aside className="w-64 bg-slate-900 text-white flex flex-col p-6 shadow-2xl">
        <div className="mb-10 p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
            <h1 className="font-black text-lg tracking-tight">BHARATH WIRE</h1>
            <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">Logged in as: {user}</p>
        </div>
        <nav className="space-y-2 flex-1">
          <SidebarBtn active={view === 'dashboard'} label="Overview" icon={<LayoutDashboard size={18}/>} onClick={() => setView('dashboard')} />
          <SidebarBtn active={view === 'orders'} label="Production" icon={<ClipboardList size={18}/>} onClick={() => setView('orders')} />
          <SidebarBtn active={view === 'stock'} label="Inventory" icon={<Database size={18}/>} onClick={() => setView('stock')} />
          {user === "Admin" && <SidebarBtn active={view === 'customers'} label="Client List" icon={<Users size={18}/>} onClick={() => setView('customers')} />}
        </nav>
        <button onClick={() => setUser(null)} className="flex items-center gap-3 p-4 text-red-400 hover:bg-white/5 rounded-2xl font-bold transition">
          <LogOut size={18} /> Logout
        </button>
      </aside>

      <main className="flex-1 overflow-y-auto p-10">
        <header className="flex justify-between items-center mb-10">
          <h2 className="text-4xl font-black text-slate-900 capitalize tracking-tight">{view}</h2>
          <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:bg-blue-700 transition">
            <Plus size={20}/> New Order
          </button>
        </header>

        {/* --- VIEW LOGIC --- */}
        {view === "dashboard" && (
           <div className="space-y-8 animate-in fade-in duration-500">
              <div className="grid grid-cols-3 gap-6">
                <StatCard label="Total Revenue" value={user === "Admin" ? `₹${orders.reduce((s,o)=>s+Number(o.amount),0).toLocaleString()}` : "Locked"} />
                <StatCard label="This Month" value={user === "Admin" ? `₹${orders.filter(o => new Date(o.createdAt).getMonth() === new Date().getMonth()).reduce((s,o)=>s+Number(o.amount),0).toLocaleString()}` : "Locked"} />
                <StatCard label="Active Orders" value={orders.filter(o => o.status !== 'Completed').length} />
              </div>
              <div className="bg-white p-8 rounded-3xl border shadow-sm">
                <OrderTable orders={orders.slice(0, 5)} type="simple" role={user} />
              </div>
           </div>
        )}

        {view === "orders" && (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-2xl shadow-sm border flex gap-4">
                <Search className="mt-2 text-slate-400" size={20} />
                <input className="flex-1 outline-none" placeholder="Search customer..." onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <div className="bg-white rounded-3xl border overflow-hidden">
               <OrderTable 
                 orders={orders.filter(o => o.customerName.toLowerCase().includes(searchTerm.toLowerCase()))} 
                 type="manage" 
                 role={user} 
                 onUpdate={updateStatus} 
                 onDelete={deleteOrder} 
               />
            </div>
          </div>
        )}

        {view === "stock" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <div className="md:col-span-2 grid grid-cols-2 gap-4">
                {stock.map(s => (
                  <div key={s._id} className="bg-white p-6 rounded-3xl border shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase">{s.itemName}</p>
                    <h4 className="text-3xl font-black">{s.quantity} {s.unit}</h4>
                  </div>
                ))}
             </div>
             <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl">
                <h3 className="font-bold mb-4">Inventory Update</h3>
                <form className="space-y-3" onSubmit={async (e) => {
                  e.preventDefault();
                  const data = { itemName: e.target.item.value, quantity: e.target.qty.value, unit: e.target.unit.value };
                  await fetch(`${API_URL}/stock`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
                  fetchStock();
                  e.target.reset();
                }}>
                  <input name="item" className="w-full bg-white/10 p-3 rounded-xl outline-none" placeholder="Item Name" required />
                  <div className="flex gap-2">
                    <input name="qty" type="number" className="flex-1 bg-white/10 p-3 rounded-xl outline-none" placeholder="Qty" required />
                    <input name="unit" className="w-20 bg-white/10 p-3 rounded-xl outline-none" placeholder="Unit" required />
                  </div>
                  <button className="w-full bg-blue-600 py-3 rounded-xl font-bold">Save Stock</button>
                </form>
             </div>
          </div>
        )}
      </main>

      {/* MODAL FOR NEW ORDER */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-10 rounded-[2.5rem] w-full max-w-md shadow-2xl">
            <h3 className="text-2xl font-black mb-6">New Factory Order</h3>
            <form onSubmit={handleOrderSubmit} className="space-y-4">
              <input className="w-full border p-4 rounded-2xl" placeholder="Customer Name" onChange={e => setFormData({...formData, customerName: e.target.value})} required />
              <input className="w-full border p-4 rounded-2xl" placeholder="Mobile Number" onChange={e => setFormData({...formData, mobile: e.target.value})} required />
              <input className="w-full border p-4 rounded-2xl" placeholder="Product Type" onChange={e => setFormData({...formData, productType: e.target.value})} required />
              <input className="w-full border p-4 rounded-2xl" placeholder="Amount (₹)" type="number" onChange={e => setFormData({...formData, amount: e.target.value})} required />
              <button disabled={loading} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg">
                {loading ? "Saving..." : "Confirm & Send WhatsApp"}
              </button>
              <button type="button" onClick={() => setShowModal(false)} className="w-full text-slate-400 font-bold">Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// HELPERS
const SidebarBtn = ({ active, label, icon, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition ${active ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
    {icon} <span className="font-bold text-sm">{label}</span>
  </button>
);

const StatCard = ({ label, value }) => (
  <div className="bg-white p-8 rounded-[2rem] border shadow-sm">
    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{label}</p>
    <p className="text-2xl font-black">{value}</p>
  </div>
);

const OrderTable = ({ orders, type, role, onUpdate, onDelete }) => (
  <table className="w-full text-left">
    <thead className="text-[10px] font-black uppercase text-slate-400 bg-slate-50 border-b">
      <tr>
        <th className="p-5">Customer</th>
        <th className="p-5">Product</th>
        <th className="p-5 text-right">Amount</th>
        {type === 'manage' && <th className="p-5">Status</th>}
        {type === 'manage' && role === "Admin" && <th className="p-5">Delete</th>}
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100">
      {orders.map(o => (
        <tr key={o._id} className="hover:bg-slate-50 transition">
          <td className="p-5 font-bold">{o.customerName}</td>
          <td className="p-5 text-sm">{o.productType}</td>
          <td className="p-5 text-right font-black">₹{Number(o.amount).toLocaleString()}</td>
          {type === 'manage' && (
            <td className="p-5">
              <select value={o.status} onChange={(e) => onUpdate(o._id, e.target.value)} className="text-[10px] font-bold p-1 border rounded">
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </td>
          )}
          {type === 'manage' && role === "Admin" && (
            <td className="p-5">
              <Trash2 size={18} className="text-red-300 hover:text-red-500 cursor-pointer" onClick={() => onDelete(o._id)} />
            </td>
          )}
        </tr>
      ))}
    </tbody>
  </table>
);

export default App;