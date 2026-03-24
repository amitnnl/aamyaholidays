import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const AdminLeads = () => {
  const { user, logout } = useContext(AuthContext);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchLeads();
    }
  }, [user]);

  const fetchLeads = () => {
    fetch(((window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')) ? 'http://localhost/aamya_holiday/backend/public/api/leads' : '/backend/public/api/leads'))
      .then(res => res.json())
      .then(data => {
          if (data.status === 'success') {
              setLeads(data.data);
          }
      })
      .finally(() => setLoading(false));
  };

  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="w-full bg-slate-50">

      <main className="flex-1 p-8 overflow-auto h-screen">
        <header className="mb-8 flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-bold text-slate-800">CRM & Master Leads</h1>
                <p className="text-slate-500">Track and respond to all inbound customer inquiries from packages.</p>
            </div>
            <button onClick={fetchLeads} className="bg-slate-200 text-slate-700 px-4 py-2 rounded hover:bg-slate-300 transition font-bold shadow-sm">
                ↻ Refresh List
            </button>
        </header>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Customer Contact</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Interest / Package</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date Submitted</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Pipeline Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {loading ? (
                <tr><td colSpan="5" className="text-center py-12 text-gray-500 font-medium">Fetching secure CRM data...</td></tr>
              ) : leads.length > 0 ? (
                leads.map(lead => (
                  <tr key={lead.id} className="hover:bg-indigo-50 transition cursor-pointer">
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-slate-900">{lead.customer_name}</div>
                        <div className="text-sm text-slate-500">{lead.customer_email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded">
                            {lead.package_title ? lead.package_title : 'General Inquiry'}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {new Date(lead.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap tracking-wide">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-black uppercase rounded ${lead.status === 'new' ? 'bg-yellow-100 text-yellow-800' : 'bg-slate-100 text-slate-800'}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <a 
                            href={`${(window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')) ? 'http://localhost/aamya_holiday/backend/public/api' : '/backend/public/api'}/pdf/invoice/${lead.id}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-teal-600 hover:text-white hover:bg-teal-600 border border-teal-600 px-3 py-1.5 rounded font-bold mr-3 transition-colors inline-block"
                        >
                            ⇩ PDF Voucher
                        </a>
                        <button className="text-slate-400 hover:text-slate-600 font-bold border-l pl-3 ml-1">Archive</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" className="text-center py-12 text-slate-400 font-medium">Your pipeline is empty.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default AdminLeads;
