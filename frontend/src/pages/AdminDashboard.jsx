import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [leads, setLeads] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [packagesCount, setPackagesCount] = useState(0);
  const [destCount, setDestCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch true CRM Leads and Bookings
  useEffect(() => {
    if (user && user.role === 'admin') {
      Promise.all([
          fetch(((window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')) ? 'http://localhost/aamya_holiday/backend/public/api/leads' : '/backend/public/api/leads')).then(res => res.json()),
          fetch(((window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')) ? 'http://localhost/aamya_holiday/backend/public/api/admin/bookings' : '/backend/public/api/admin/bookings')).then(res => res.json()),
          fetch(((window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')) ? 'http://localhost/aamya_holiday/backend/public/api/packages' : '/backend/public/api/packages')).then(res => res.json()),
          fetch(((window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')) ? 'http://localhost/aamya_holiday/backend/public/api/destinations' : '/backend/public/api/destinations')).then(res => res.json())
      ]).then(([leadsData, bookingsData, packagesData, destData]) => {
          if (leadsData.status === 'success') setLeads(leadsData.data);
          if (bookingsData.status === 'success') setBookings(bookingsData.data);
          if (packagesData.status === 'success') setPackagesCount(packagesData.data.length);
          if (destData.status === 'success') setDestCount(destData.data.length);
      }).finally(() => setLoading(false));
    }
  }, [user]);

  // Revenue calculation logic
  const getRevenueData = () => {
    if (!bookings || bookings.length === 0) return [];
    
    const revenueByDate = {};
    bookings.forEach(bkg => {
        if (bkg.status !== 'Cancelled') {
            const dateStr = bkg.created_at ? new Date(bkg.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Recent';
            if (!revenueByDate[dateStr]) revenueByDate[dateStr] = 0;
            revenueByDate[dateStr] += parseFloat(bkg.total_amount) || 0;
        }
    });
    
    return Object.keys(revenueByDate).map(date => ({
        name: date,
        Revenue: revenueByDate[date]
    })).slice(-14); // Last 14 segments
  };

  // Protect route
  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="w-full bg-slate-50">

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-auto h-screen">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Welcome Back, {user.name}</h1>
            <p className="text-slate-500">Here is what's happening with Aamya Holidays today.</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm bg-teal-100 text-teal-700 px-3 py-1 rounded-full font-bold">Admin Privileges</span>
          </div>
        </header>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 animate-fade-up delay-100 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-2">
                <p className="text-sm font-extrabold text-slate-400 uppercase tracking-widest">Active Packages</p>
                <div className="p-2 bg-indigo-50 rounded-xl"><span className="text-indigo-600">📦</span></div>
            </div>
            <h3 className="text-4xl font-black text-slate-800 animate-float">{loading ? '-' : packagesCount}</h3>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 animate-fade-up delay-200 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-2">
                <p className="text-sm font-extrabold text-slate-400 uppercase tracking-widest">CRM Leads</p>
                <div className="p-2 bg-amber-50 rounded-xl"><span className="text-amber-600">🎯</span></div>
            </div>
            <h3 className="text-4xl font-black text-amber-600 animate-float">{loading ? '-' : leads.length}</h3>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 animate-fade-up delay-300 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-2">
                <p className="text-sm font-extrabold text-slate-400 uppercase tracking-widest">Revenue Bookings</p>
                <div className="p-2 bg-teal-50 rounded-xl"><span className="text-teal-600">💳</span></div>
            </div>
            <h3 className="text-4xl font-black text-teal-600 animate-float">{loading ? '-' : bookings.length}</h3>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 animate-fade-up delay-400 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-2">
                <p className="text-sm font-extrabold text-slate-400 uppercase tracking-widest">Global Destinations</p>
                <div className="p-2 bg-blue-50 rounded-xl"><span className="text-blue-600">🌍</span></div>
            </div>
            <h3 className="text-4xl font-black text-slate-800 animate-float">{loading ? '-' : destCount}</h3>
          </div>
        </div>

        {/* Recharts Analytics Module */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col mb-8 p-6 animate-fade-up delay-200 h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800">Gross Revenue Trends (INR)</h2>
          </div>
          <div className="flex-1 w-full min-h-[300px]">
            {loading ? (
                <div className="h-full flex items-center justify-center text-slate-400 font-bold">Rendering Analysis...</div>
            ) : getRevenueData().length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={getRevenueData()} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} tickFormatter={val => `₹${val/1000}k`} />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                        <Area type="monotone" dataKey="Revenue" stroke="#0d9488" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-full flex items-center justify-center text-slate-400 italic">No valid revenue data points.</div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 animate-slide-right delay-200">
            {/* True E-commerce Bookings Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[500px]">
              <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-lg font-bold text-slate-800">Latest Live Transactions</h2>
                <Link to="/admin/bookings" className="text-sm text-teal-600 hover:underline font-bold bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-100">Manage Finance &rarr;</Link>
              </div>
              <div className="overflow-auto flex-1 p-2">
                  <table className="min-w-full divide-y divide-slate-100">
                    <tbody className="bg-white divide-y divide-slate-100">
                      {loading ? (
                        <tr><td className="text-center py-8 text-gray-500 font-bold">Querying databases...</td></tr>
                      ) : bookings.length > 0 ? (
                        bookings.slice(0,5).map(bkg => (
                          <tr key={bkg.id} className="hover:bg-slate-50 transition">
                            <td className="px-4 py-4 whitespace-nowrap">
                                <span className="block text-sm font-bold text-slate-900">{bkg.primary_guest_name}</span>
                                <span className="block text-xs font-mono text-teal-600">{bkg.booking_ref}</span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-right">
                                <span className="block text-sm font-black text-green-600">₹{bkg.total_amount}</span>
                                <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase ${bkg.status === 'Confirmed' ? 'bg-teal-100 text-teal-700' : 'bg-slate-200 text-slate-600'}`}>
                                    {bkg.status}
                                </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr><td className="text-center py-10 text-slate-400 font-medium italic">No active transactions.</td></tr>
                      )}
                    </tbody>
                  </table>
              </div>
            </div>

            {/* True CRM Leads Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[500px]">
              <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-lg font-bold text-slate-800">Recent Lead Inquiries</h2>
                <Link to="/admin/leads" className="text-sm text-amber-600 hover:underline font-bold bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">Open CRM &rarr;</Link>
              </div>
              <div className="overflow-auto flex-1 p-2">
                  <table className="min-w-full divide-y divide-slate-100">
                    <thead className="bg-slate-50/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Inquiry</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                      {loading ? (
                        <tr><td colSpan="3" className="text-center py-8 text-gray-500 font-bold">Querying databases...</td></tr>
                      ) : leads.length > 0 ? (
                        leads.slice(0,5).map(lead => (
                          <tr key={lead.id} className="hover:bg-slate-50 transition">
                            <td className="px-4 py-4 whitespace-nowrap">
                                <span className="block text-sm font-bold text-slate-900">{lead.customer_name}</span>
                                <span className="block text-xs text-slate-500">{lead.customer_email}</span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                                <span className="block text-sm text-slate-700 font-medium truncate w-32">{lead.package_title ? lead.package_title : 'General Inquiry'}</span>
                                <span className={`inline-flex px-2 py-0.5 mt-1 rounded text-[10px] font-bold uppercase ${lead.status === 'new' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-600'}`}>
                                    {lead.status}
                                </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-400 font-medium">
                              {new Date(lead.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan="3" className="text-center py-10 text-slate-400 font-medium italic">No inquiries received yet.</td></tr>
                      )}
                    </tbody>
                  </table>
              </div>
            </div>
        </div>

      </main>
    </div>
  );
};

export default AdminDashboard;
