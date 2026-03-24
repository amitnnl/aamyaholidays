import { useState, useEffect } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const AdminPages = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ title: '', slug: '', meta_description: '', content: '', is_published: true });
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = () => {
    setLoading(true);
    fetch(((window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')) ? 'http://localhost/aamya_holiday/backend/public/api/pages' : '/backend/public/api/pages'))
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setPages(data.data);
        }
      })
      .finally(() => setLoading(false));
  };

  const handleCreateNew = () => {
    setEditingId(null);
    setFormData({ title: '', slug: '', meta_description: '', content: '', is_published: true });
    setShowForm(true);
    setMessage('');
  };

  const handleEdit = (slug) => {
    setMessage('Loading page data...');
    fetch(`${(window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')) ? 'http://localhost/aamya_holiday/backend/public/api' : '/backend/public/api'}/pages/${slug}`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          const pg = data.data;
          setFormData({
            title: pg.title,
            slug: pg.slug,
            meta_description: pg.meta_description || '',
            content: pg.content,
            is_published: pg.is_published === 1
          });
          setEditingId(pg.id);
          setShowForm(true);
          setMessage('');
        }
      });
  };

  const generateSlug = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  const handleTitleChange = (e) => {
    const title = e.target.value;
    if (!editingId) {
      setFormData({ ...formData, title, slug: generateSlug(title) });
    } else {
      setFormData({ ...formData, title });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('Saving...');
    try {
      const payload = { ...formData, is_published: formData.is_published ? 1 : 0 };
      if (editingId) payload.id = editingId;

      const res = await fetch(((window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')) ? 'http://localhost/aamya_holiday/backend/public/api/pages' : '/backend/public/api/pages'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (data.status === 'success') {
        setMessage('Page saved successfully!');
        fetchPages();
        setTimeout(() => { setShowForm(false); setMessage(''); }, 1500);
      } else {
        setMessage(data.message || 'Error saving page');
      }
    } catch(err) {
      setMessage('Network error while saving');
    }
  };

  return (
    <div className="w-full bg-slate-50 min-h-screen">
      <main className="flex-1 p-8 overflow-auto h-screen">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Page Manager (CMS)</h1>
            <p className="text-slate-500 font-medium mt-1">Create and publish static generic pages like About Us, Privacy Policy.</p>
          </div>
          {!showForm && (
            <button onClick={handleCreateNew} className="bg-teal-600 hover:bg-teal-500 text-white font-extrabold px-6 py-3 rounded-xl shadow-lg transition transform hover:-translate-y-1">
                + Create New Page
            </button>
          )}
        </header>

        {showForm ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 w-full">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                <h2 className="text-2xl font-bold text-slate-800">{editingId ? 'Edit Page' : 'Draft New Page'}</h2>
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
                        <label className="block text-sm font-bold text-slate-700 mb-2">Page Title</label>
                        <input required type="text" value={formData.title} onChange={handleTitleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 outline-none font-medium" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">URL Slug</label>
                        <div className="flex items-center">
                            <span className="bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl px-4 py-3 text-slate-500 font-mono text-sm">/p/</span>
                            <input required type="text" value={formData.slug} onChange={e => setFormData({...formData, slug: generateSlug(e.target.value)})} className="flex-1 bg-slate-50 border border-slate-200 rounded-r-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 outline-none font-mono text-sm" />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Meta Description (SEO)</label>
                    <textarea value={formData.meta_description} onChange={e => setFormData({...formData, meta_description: e.target.value})} rows="2" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 outline-none font-medium text-sm"></textarea>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-6 max-w-full">
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                      <label className="block text-sm font-bold text-slate-700">Page Content</label>
                    </div>
                    <ReactQuill 
                        theme="snow"
                        value={formData.content} 
                        onChange={val => setFormData({...formData, content: val})} 
                        className="w-full max-w-full [&_.ql-editor]:min-h-[300px] [&_.ql-editor]:break-words [&_.ql-container]:border-none [&_.ql-toolbar]:border-none [&_.ql-toolbar]:bg-slate-50 [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-slate-200"
                    />
                </div>

                <div className="flex items-center gap-3 pt-2">
                    <input type="checkbox" id="publish" checked={formData.is_published} onChange={e => setFormData({...formData, is_published: e.target.checked})} className="w-5 h-5 text-teal-600 rounded bg-slate-100 border-slate-300 focus:ring-teal-500 focus:ring-2" />
                    <label htmlFor="publish" className="font-bold text-slate-700 select-none">Publish immediately</label>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button type="submit" className="bg-teal-600 hover:bg-teal-500 text-white font-extrabold px-8 py-4 rounded-xl shadow-lg transition transform hover:-translate-y-1">
                        {editingId ? 'Update Published Page' : 'Save & Publish Page'}
                    </button>
                </div>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-8 py-4 text-left text-xs font-extrabold text-slate-500 uppercase tracking-widest">Page Name</th>
                  <th className="px-6 py-4 text-left text-xs font-extrabold text-slate-500 uppercase tracking-widest">URL Slug</th>
                  <th className="px-6 py-4 text-left text-xs font-extrabold text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-extrabold text-slate-500 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {loading ? (
                    <tr><td colSpan="4" className="text-center py-10 text-slate-400 font-bold tracking-wide">Loading pages...</td></tr>
                ) : pages.length > 0 ? (
                  pages.map(page => (
                    <tr key={page.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-8 py-5 whitespace-nowrap text-sm font-extrabold text-slate-900">{page.title}</td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm font-mono text-slate-500">/p/{page.slug}</td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full uppercase tracking-wider ${page.is_published ? 'bg-teal-100 text-teal-700' : 'bg-slate-200 text-slate-600'}`}>
                          {page.is_published ? 'Live' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-bold">
                        <a href={`/p/${page.slug}`} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-indigo-600 mr-4 transition-colors">View</a>
                        <button onClick={() => handleEdit(page.slug)} className="text-teal-600 hover:text-teal-800 transition-colors">Edit</button>
                      </td>
                    </tr>
                  ))
                ) : (
                    <tr><td colSpan="4" className="text-center py-12 text-slate-400">
                        <p className="font-bold text-lg mb-2">No pages found.</p>
                        <p className="text-sm">Click the green button above to draft your first article.</p>
                    </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPages;
