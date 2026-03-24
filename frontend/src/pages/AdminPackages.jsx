import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';

const AdminPackages = () => {
  const { user, logout } = useContext(AuthContext);
  const [packages, setPackages] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [vendors, setVendors] = useState([]);
  
  // Form state
  const [formData, setFormData] = useState({ id: '', title: '', slug: '', price: '', days: '', nights: '', destination_id: '', vendor_id: '', status: 'active' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchPackages();
      fetchDestinations();
      fetchVendors();
    }
  }, [user]);

  const fetchVendors = () => {
    fetch('http://localhost/aamya_holiday/backend/public/api/vendors')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') setVendors(data.data);
      });
  };

  const fetchPackages = () => {
    fetch('http://localhost/aamya_holiday/backend/public/api/packages')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') setPackages(data.data);
      });
  };

  const fetchDestinations = () => {
    fetch('http://localhost/aamya_holiday/backend/public/api/destinations')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') setDestinations(data.data);
      });
  };

  const generateSlug = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  const handleEdit = (slug) => {
    const pkg = packages.find(p => p.slug === slug);
    if (pkg) {
        setFormData({
            id: pkg.id,
            title: pkg.title,
            slug: pkg.slug,
            price: pkg.price,
            days: pkg.days,
            nights: pkg.nights,
            destination_id: pkg.destination_id,
            vendor_id: pkg.vendor_id || '',
            status: pkg.status || 'active'
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDelete = async (slug, id) => {
    if (!window.confirm(`Are you sure you want to permanently delete this package?`)) return;
    setLoading(true);
    try {
      const response = await fetch(`http://localhost/aamya_holiday/backend/public/api/packages/${id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data.status === 'success') {
        setMsg({ type: 'success', text: 'Package permanently erased.' });
        fetchPackages();
      } else {
        setMsg({ type: 'error', text: data.message });
      }
    } catch (err) {
      setMsg({ type: 'error', text: 'Connection error' });
    } finally {
      setLoading(false);
    }
  };

  const handleTitleChange = (e) => {
    setFormData({ ...formData, title: e.target.value, slug: generateSlug(e.target.value) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });

    try {
      const response = await fetch('http://localhost/aamya_holiday/backend/public/api/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      
      if (response.ok && data.status === 'success') {
        setMsg({ type: 'success', text: formData.id ? 'Package updated successfully!' : 'Package created successfully!' });
        setFormData({ id: '', title: '', slug: '', price: '', days: '', nights: '', destination_id: '', vendor_id: '', status: 'active' });
        fetchPackages(); // Refresh list
      } else {
        setMsg({ type: 'error', text: data.message || 'Failed to create package' });
      }
    } catch (err) {
      setMsg({ type: 'error', text: 'Connection error' });
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="w-full bg-slate-50">

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-auto h-screen">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Tour Package Manager</h1>
          <p className="text-slate-500">Create and monitor the tour packages displayed on your website.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Form */}
          <div className="lg:col-span-1 border border-slate-200 bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-6 border-b pb-2">Create New Package</h2>
            
            {msg.text && (
              <div className={`p-4 mb-6 rounded-md text-sm font-semibold ${msg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {msg.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Package Title</label>
                <input required type="text" value={formData.title} onChange={handleTitleChange} className="w-full p-2 border border-slate-300 rounded focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. Dubai Desert Safari" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">URL Slug</label>
                <input required type="text" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className="w-full p-2 border border-slate-300 rounded bg-slate-50 text-slate-500" readOnly />
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Destination</label>
                    <select required value={formData.destination_id} onChange={e => setFormData({...formData, destination_id: e.target.value})} className="w-full p-2 border border-slate-300 rounded focus:ring-blue-500">
                      <option value="">-- Location --</option>
                      {destinations.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Assigned Vendor</label>
                    <select value={formData.vendor_id} onChange={e => setFormData({...formData, vendor_id: e.target.value})} className="w-full p-2 border border-slate-300 rounded focus:ring-blue-500">
                      <option value="">-- Optional B2B --</option>
                      {vendors.map(v => <option key={v.id} value={v.id}>{v.name} ({v.type})</option>)}
                    </select>
                  </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Days</label>
                  <input required type="number" min="1" value={formData.days} onChange={e => setFormData({...formData, days: e.target.value})} className="w-full p-2 border border-slate-300 rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nights</label>
                  <input type="number" min="0" value={formData.nights} onChange={e => setFormData({...formData, nights: e.target.value})} placeholder="Optional" className="w-full p-2 border border-slate-300 rounded" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Price (₹)</label>
                <input required type="number" step="0.01" min="0" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full p-2 border border-slate-300 rounded" />
              </div>

              <button type="submit" disabled={loading} className="w-full py-3 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 transition disabled:opacity-50 mt-4">
                {loading ? 'Processing...' : formData.id ? 'Update Package' : '+ Create Package'}
              </button>
            </form>
          </div>

          {/* Package List */}
          <div className="lg:col-span-2 border border-slate-200 bg-white rounded-xl shadow-sm overflow-hidden flex flex-col h-[700px]">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-800">Active Packages Catalog</h2>
            </div>
            <div className="overflow-auto flex-1">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Duration</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {packages.length > 0 ? packages.map(pkg => (
                    <tr key={pkg.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                          <span className="block text-sm font-bold text-blue-700">{pkg.title}</span>
                          {pkg.vendor_name && <span className="block text-xs text-slate-400 font-mono mt-0.5">Operated by: {pkg.vendor_name}</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{pkg.destination_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{pkg.days}D / {pkg.nights}N</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">₹{pkg.price}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold flex gap-3">
                        <button onClick={() => handleEdit(pkg.slug)} className="text-blue-600 hover:text-blue-900 transition">Edit</button>
                        <button onClick={() => handleDelete(pkg.slug, pkg.id)} className="text-red-500 hover:text-red-800 transition">Delete</button>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="4" className="text-center py-8 text-slate-400">Loading packages...</td></tr>
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

export default AdminPackages;
