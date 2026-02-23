import React, { useEffect, useState } from "react";
import { 
  LayoutDashboard, ClipboardList, Users, FileText, 
  Plus, Search, LogOut, Package, IndianRupee, 
  CheckCircle, Clock, X, Loader2, Calendar 
} from "lucide-react";

const API_URL = "https://factory-erp-backend.onrender.com";

function App() {
  const [orders, setOrders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "", mobile: "", address: "", pincode: "",
    state: "", city: "", country: "", orderType: "",
    acres: "", units: "", soilType: "", productType: "",
    material: "", dimension: "", deliveryDate: "", amount: "",
  });

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/orders`);
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, status: "Order placed" }),
      });
      const data = await response.json();
      if (response.ok) {
        setOrders((prev) => [data, ...prev]);
        setShowModal(false);
        setFormData({});
      }
    } catch (error) { console.error(error); }
    setLoading(false);
  };

  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.amount || 0), 0);

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg"><Package size={20} /></div>
            <span className="text-xl font-bold tracking-tight">Factory<span className="text-blue-400">ERP</span></span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <SidebarItem icon={<LayoutDashboard size={20}/>} label="Dashboard" active />
          <SidebarItem icon={<ClipboardList size={20}/>} label="Orders" />
          <SidebarItem icon={<Users size={20}/>} label="Customers" />
          <SidebarItem icon={<FileText size={20}/>} label="Reports" />
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors w-full p-2">
            <LogOut size={20} /> <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* HEADER */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm">
          <div className="flex items-center gap-4 bg-slate-100 px-4 py-2 rounded-full w-96">
            <Search size={18} className="text-slate-400" />
            <input type="text" placeholder="Search orders..." className="bg-transparent outline-none text-sm w-full" />
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-all transform active:scale-95 shadow-lg shadow-blue-200"
          >
            <Plus size={20} /> New Order
          </button>
        </header>

        {/* DASHBOARD BODY */}
        <div className="p-8 overflow-y-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800">Operational Overview</h2>
            <p className="text-slate-500">Real-time factory production and revenue status.</p>
          </div>

          {/* STATS CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            <StatCard label="Total Orders" value={orders.length} icon={<ClipboardList className="text-blue-600"/>} color="border-blue-500" />
            <StatCard label="Total Revenue" value={`₹${totalRevenue.toLocaleString()}`} icon={<IndianRupee className="text-green-600"/>} color="border-green-500" />
            <StatCard label="Active Clients" value={orders.length} icon={<Users className="text-purple-600"/>} color="border-purple-500" />
            <StatCard label="Pending Production" value="0