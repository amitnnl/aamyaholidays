import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';

const AdminVendors = () => {
    const { user, logout } = useContext(AuthContext);
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Form state
    const [formData, setFormData] = useState({ id: '', name: '', type: 'hotel', contact_email: '', contact_phone: '', status: 'active' });
    const [msg, setMsg] = useState({ type: '', text: '' });

    useEffect(() => {
        if (user && user.role === 'admin') {
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

    const handleEdit = (id) => {
        const vendor = vendors.find(v => v.id === id);
        if (vendor) {
            setFormData({
                id: vendor.id,
                name: vendor.name,
                type: vendor.type,
                contact_email: vendor.contact_email || '',
                contact_phone: vendor.contact_phone || '',
                status: vendor.status || 'active'
            });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm(`Are you sure you want to permanently delete this vendor?`)) return;
        setLoading(true);
        try {
            const response = await fetch(`http://localhost/aamya_holiday/backend/public/api/vendors/${id}`, {
                method: 'DELETE'
            });
            const data = await response.json();
            if (data.status === 'success') {
                setMsg({ type: 'success', text: 'Vendor permanently erased.' });
                fetchVendors();
            } else {
                setMsg({ type: 'error', text: data.message });
            }
        } catch (err) {
            setMsg({ type: 'error', text: 'Connection error' });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg({ type: '', text: '' });

        try {
            const response = await fetch('http://localhost/aamya_holiday/backend/public/api/vendors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            
            if (response.ok && data.status === 'success') {
                setMsg({ type: 'success', text: formData.id ? 'Vendor perfectly updated!' : 'Vendor safely added!' });
                setFormData({ id: '', name: '', type: 'hotel', contact_email: '', contact_phone: '', status: 'active' });
                fetchVendors();
            } else {
                setMsg({ type: 'error', text: data.message || 'Failed to add vendor' });
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

            {/* Main Wrapper */}
            <main className="flex-1 p-8 overflow-auto h-screen">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-800">Vendor Relationship Management</h1>
                    <p className="text-slate-500">Track and add B2B partners, transport, and hotels directly into your internal directory.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Form Section */}
                    <div className="lg:col-span-1 border border-slate-200 bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-lg font-bold text-slate-800 mb-6 border-b pb-2">Add New Vendor</h2>
                        
                        {msg.text && (
                            <div className={`p-4 mb-6 rounded-md text-sm font-semibold ${msg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {msg.text}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Company / Name</label>
                                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2 border border-slate-300 rounded focus:ring-blue-500" placeholder="e.g. Hiltons Co." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Category Type</label>
                                <select required value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full p-2 border border-slate-300 rounded focus:ring-blue-500">
                                    <option value="hotel">Hotel & Accommodation</option>
                                    <option value="transport">Transportation / Flights</option>
                                    <option value="guide">Tour Guide</option>
                                    <option value="activity">Local Activity Provider</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                                <input type="email" value={formData.contact_email} onChange={e => setFormData({...formData, contact_email: e.target.value})} className="w-full p-2 border border-slate-300 rounded focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Contact</label>
                                <input type="text" value={formData.contact_phone} onChange={e => setFormData({...formData, contact_phone: e.target.value})} className="w-full p-2 border border-slate-300 rounded focus:ring-blue-500" />
                            </div>

                            <button type="submit" disabled={loading} className="w-full py-3 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 transition disabled:opacity-50 mt-4">
                                {loading ? 'Processing...' : formData.id ? 'Update Associated Vendor' : '+ Register Vendor Access'}
                            </button>
                        </form>
                    </div>

                    {/* Vendor DB Grid */}
                    <div className="lg:col-span-2 border border-slate-200 bg-white rounded-xl shadow-sm overflow-hidden flex flex-col h-[650px]">
                        <div className="px-6 py-4 border-b border-slate-200">
                            <h2 className="text-lg font-bold text-slate-800">Master Directory Index</h2>
                        </div>
                        <div className="overflow-auto flex-1 p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {vendors.length > 0 ? vendors.map(vendor => (
                                    <div key={vendor.id} className="border border-slate-200 rounded-lg p-5 hover:shadow-md transition bg-slate-50 relative">
                                        <div className={`absolute top-4 right-4 h-2 w-2 rounded-full ${vendor.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                        <span className="text-xs uppercase tracking-wider font-bold text-blue-600 block mb-1">{vendor.type}</span>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">{vendor.name}</h3>
                                        <div className="text-sm text-slate-600 space-y-1">
                                            <p>📧 {vendor.contact_email || 'N/A'}</p>
                                            <p>📞 {vendor.contact_phone || 'N/A'}</p>
                                        </div>
                                        <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between">
                                            <button onClick={() => handleEdit(vendor.id)} className="text-teal-600 hover:text-teal-800 font-bold transition">✏️ Edit Profile</button>
                                            <button onClick={() => handleDelete(vendor.id)} className="text-red-500 hover:text-red-800 font-bold transition">✖ Delete</button>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="col-span-full py-12 text-center text-slate-500 font-medium">Loading internal vendor database...</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminVendors;
