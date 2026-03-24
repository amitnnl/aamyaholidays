import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import ImageUploader from '../components/ImageUploader';

const AdminStays = () => {
  const { user } = useContext(AuthContext);
  const [stays, setStays] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  
  const [formData, setFormData] = useState({
     name: '', location: '', price_per_night: '', rating: 5.0, image_url: '', description: '', amenitiesInput: ''
  });

  useEffect(() => {
    fetchStays();
  }, [user]);

  const fetchStays = () => {
    if (user && user.role === 'admin') {
      setLoading(true);
      fetch('http://localhost/aamya_holiday/backend/public/api/stays')
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                setStays(data.data);
            }
        })
        .finally(() => setLoading(false));
    }
  };

  const handleCreateNew = () => {
      setEditingId(null);
      setFormData({ name: '', location: '', price_per_night: '', rating: 5.0, image_url: '', description: '', amenitiesInput: '' });
      setShowForm(true);
      setMessage('');
  };

  const handleEdit = (slug) => {
      setMessage('Loading property data...');
      fetch(`http://localhost/aamya_holiday/backend/public/api/stays/${slug}`)
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                const stay = data.data;
                setFormData({
                    name: stay.name, location: stay.location, price_per_night: stay.price_per_night,
                    rating: stay.rating, image_url: stay.image_url || '', description: stay.description || '',
                    amenitiesInput: Array.isArray(stay.amenities) ? stay.amenities.join(', ') : ''
                });
                setEditingId(stay.id);
                setShowForm(true);
                setMessage('');
            }
        });
  };

  const handleSubmit = async (e) => {
      e.preventDefault();
      setMessage('Saving property...');
      try {
          // Parse amenities into array natively
          const amenitiesArray = formData.amenitiesInput.split(',')
                    .map(item => item.trim())
                    .filter(item => item.length > 0);
          
          const payload = {
              ...formData,
              price_per_night: parseFloat(formData.price_per_night),
              rating: parseFloat(formData.rating),
              amenities: amenitiesArray
          };
          if (editingId) payload.id = editingId;

          const res = await fetch('http://localhost/aamya_holiday/backend/public/api/stays', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
          });
          const data = await res.json();
          if (data.status === 'success') {
              setMessage('Property saved successfully!');
              fetchStays();
              setTimeout(() => { setShowForm(false); setMessage(''); }, 1500);
          } else {
              setMessage(data.message || 'Error saving property');
          }
      } catch (err) {
          setMessage('Network error while saving');
      }
  };

  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="w-full bg-slate-50 min-h-screen">
      <main className="flex-1 p-8 overflow-auto h-screen">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Property Directory</h1>
            <p className="text-slate-500">Manage hotel and resort listings globally.</p>
          </div>
          {!showForm && (
              <button onClick={handleCreateNew} className="bg-teal-600 hover:bg-teal-700 text-white font-extrabold px-6 py-3 rounded-xl shadow-md transition transform hover:-translate-y-1">
                + Add Property
              </button>
          )}
        </header>

        {showForm ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 w-full">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                  <h2 className="text-2xl font-bold text-slate-800">{editingId ? 'Edit Property' : 'List New Property'}</h2>
                  <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 font-bold px-3 py-1 bg-slate-100 rounded">Cancel</button>
              </div>
              
              {message && (
                  <div className={`p-4 rounded-xl mb-6 font-bold flex items-center gap-3 ${message.includes('success') ? 'bg-teal-50 text-teal-700' : 'bg-slate-100 text-slate-700'}`}>
                      {message}
                  </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Property Name</label>
                        <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-teal-500 font-medium" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Location (City, Country)</label>
                        <input required type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-teal-500 font-medium" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Price Per Night (₹)</label>
                        <input required type="number" step="0.01" value={formData.price_per_night} onChange={e => setFormData({...formData, price_per_night: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-teal-500 font-bold text-slate-900" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Star Rating (0-5)</label>
                        <input required type="number" step="0.1" min="0" max="5" value={formData.rating} onChange={e => setFormData({...formData, rating: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-amber-500 font-bold text-amber-600" />
                    </div>
                    <div>
                        <ImageUploader 
                            label="Property Image" 
                            value={formData.image_url} 
                            onChange={url => setFormData({...formData, image_url: url})} 
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Amenities (Comma separated)</label>
                    <input type="text" value={formData.amenitiesInput} onChange={e => setFormData({...formData, amenitiesInput: e.target.value})} placeholder="e.g. Free WiFi, Pool, Spa" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-teal-500 font-medium text-sm" />
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Detailed Description</label>
                    <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows="4" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-teal-500 font-medium text-sm"></textarea>
                </div>

                <div className="pt-4 border-t border-slate-100 text-right">
                    <button type="submit" className="bg-teal-600 hover:bg-teal-500 text-white font-extrabold px-8 py-3 rounded-xl shadow-lg transition transform hover:-translate-y-1">
                        {editingId ? 'Update Property' : 'Publish Property'}
                    </button>
                </div>
              </form>
            </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">All Listed Stays</h2>
            </div>
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-extrabold text-slate-500 uppercase tracking-widest">Property</th>
                  <th className="px-6 py-4 text-left text-xs font-extrabold text-slate-500 uppercase tracking-widest">Location</th>
                  <th className="px-6 py-4 text-left text-xs font-extrabold text-slate-500 uppercase tracking-widest">Nightly Rate</th>
                  <th className="px-6 py-4 text-left text-xs font-extrabold text-slate-500 uppercase tracking-widest">Rating</th>
                  <th className="px-6 py-4 text-right text-xs font-extrabold text-slate-500 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan="5" className="text-center py-8 text-gray-500">Loading properties...</td></tr>
                ) : stays.length > 0 ? (
                  stays.map(row => (
                    <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900 flex items-center gap-4">
                          <img src={row.image_url || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500"} className="w-12 h-12 rounded-xl object-cover shadow-sm" alt="Thumb"/>
                          {row.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                          {row.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-teal-600 font-black">
                          ₹{Number(row.price_per_night).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-500 font-bold tracking-widest">
                          ★ {row.rating}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold">
                        <button onClick={() => handleEdit(row.slug)} className="text-teal-600 hover:text-teal-900 transition-colors">Edit Property</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="5" className="text-center py-12 text-slate-500 font-medium bg-slate-50/50">There are no properties listed yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminStays;
