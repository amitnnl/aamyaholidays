import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import ImageUploader from '../components/ImageUploader';

const AdminDestinations = () => {
  const { user, logout } = useContext(AuthContext);
  const [destinations, setDestinations] = useState([]);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    id: '', name: '', slug: '', description: '', image_url: '', meta_title: '', meta_description: ''
  });
  const [loading, setLoading] = useState(false); // Keep loading state for form submission
  const [msg, setMsg] = useState({ type: '', text: '' }); // Keep msg state for error/success messages

  useEffect(() => {
    // Removed user role check as per instruction, assuming admin access is handled by Navigate
    fetchDestinations();
  }, []);

  const fetchDestinations = () => {
    fetch(((window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')) ? 'http://localhost/aamya_holiday/backend/public/api/destinations' : '/backend/public/api/destinations'))
      .then(res => res.json())
      .then(data => {
        if(data.status === 'success') setDestinations(data.data);
      })
      .catch(err => console.error(err));
  };

  const handleEdit = (slug) => {
      const destToEdit = destinations.find(d => d.slug === slug);
      if (destToEdit) {
          setFormData({
              id: destToEdit.id,
              name: destToEdit.name,
              slug: destToEdit.slug,
              description: destToEdit.description || '',
              image_url: destToEdit.image_url || '',
              meta_title: destToEdit.meta_title || '',
              meta_description: destToEdit.meta_description || ''
          });
          window.scrollTo({ top: 0, behavior: 'smooth' });
      }
  };
  
  const handleDelete = async (slug, id) => {
    if (!window.confirm(`Are you sure you want to permanently delete this location?`)) return;
    setLoading(true);
    try {
      const response = await fetch(`${(window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')) ? 'http://localhost/aamya_holiday/backend/public/api' : '/backend/public/api'}/destinations/${id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data.status === 'success') {
        setMessage('Location wiped from database successfully!');
        fetchDestinations();
      } else {
        setMsg({ type: 'error', text: data.message });
      }
    } catch (err) {
      setMsg({ type: 'error', text: 'Connection error' });
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  const handleNameChange = (e) => {
    setFormData({ ...formData, name: e.target.value, slug: generateSlug(e.target.value) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' }); // Clear previous messages

    try {
      const response = await fetch(((window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')) ? 'http://localhost/aamya_holiday/backend/public/api/destinations' : '/backend/public/api/destinations'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      
      if (data.status === 'success') { // Changed from response.ok && data.status === 'success'
        setMessage('Destination saved successfully!'); // Changed from setMsg
        setMsg({ type: 'success', text: formData.id ? 'Destination updated successfully!' : 'Destination created successfully!' });
        setFormData({ id: '', name: '', slug: '', description: '', image_url: '', meta_title: '', meta_description: '' }); // Changed formData reset
        fetchDestinations();
      } else {
        setMsg({ type: 'error', text: data.message || 'Failed to save destination' }); // Updated message
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

      <main className="flex-1 p-8 overflow-auto h-screen">
        <header className="mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900">Destinations Manager</h1>
            <p className="text-slate-500 font-medium mt-1">Add, edit, or remove geographic regions.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 border border-slate-200 bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-6 border-b pb-2">{formData.id ? 'Edit Location' : 'Add New Location'}</h2>
            
            {msg.text && (
              <div className={`p-4 mb-6 rounded-md text-sm font-semibold ${msg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {msg.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Destination Name</label>
                <input required type="text" value={formData.name} onChange={handleNameChange} className="w-full p-2 border border-slate-300 rounded focus:ring-blue-500" placeholder="e.g. Kyoto, Japan" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">URL Slug</label>
                <input required type="text" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className="w-full p-2 border border-slate-300 rounded bg-slate-50 text-slate-500" readOnly />
              </div>

              <div>
                  <ImageUploader 
                      label="Image Feature" 
                      value={formData.image_url} 
                      onChange={url => setFormData({...formData, image_url: url})} 
                  />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea required rows="4" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-2 border border-slate-300 rounded focus:ring-blue-500"></textarea>
              </div>

              <button type="submit" disabled={loading} className="w-full py-3 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 transition disabled:opacity-50 mt-4">
                {loading ? 'Processing...' : formData.id ? 'Update Destination' : '+ Create Destination'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 border border-slate-200 bg-white rounded-xl shadow-sm overflow-hidden flex flex-col h-[700px]">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-800">Master Destinations</h2>
            </div>
            <div className="overflow-auto flex-1 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {destinations.length > 0 ? destinations.map(dest => (
                    <div key={dest.id} className="border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition">
                        <div className="h-32 bg-slate-200 overflow-hidden">
                            {dest.image_url ? (
                                <img src={dest.image_url} alt={dest.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-slate-300 flex items-center justify-center text-slate-500 font-bold tracking-widest uppercase text-xs">No Image</div>
                            )}
                        </div>
                        <div className="p-4">
                            <h3 className="text-lg font-bold text-slate-900 mb-1">{dest.name}</h3>
                            <p className="text-xs text-slate-400 mb-2 font-mono">/{dest.slug}</p>
                            <p className="text-sm text-slate-600 line-clamp-2">{dest.description}</p>
                        </div>
                        <div className="p-3 border-t border-slate-100 flex justify-between bg-slate-50 rounded-b-lg">
                            <button onClick={() => handleEdit(dest.slug)} className="text-teal-600 font-bold hover:text-teal-800 transition">✏️ Edit</button>
                            <button onClick={() => handleDelete(dest.slug, dest.id)} className="text-red-500 font-bold hover:text-red-800 transition">✖ Delete</button>
                        </div>
                    </div>
                    )) : (
                    <div className="col-span-full text-center py-8 text-slate-400">Loading destinations...</div>
                    )}
                </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDestinations;
