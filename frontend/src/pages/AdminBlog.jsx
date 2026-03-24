import { useState, useEffect } from 'react';
import ImageUploader from '../components/ImageUploader';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const AdminBlog = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ title: '', slug: '', excerpt: '', image_url: '', content: '', status: 'draft' });
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = () => {
    setLoading(true);
    // Add ?admin=true to bypass the 'published filter' in controller
    fetch('http://localhost/aamya_holiday/backend/public/api/blog?admin=true')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setBlogs(data.data);
        }
      })
      .finally(() => setLoading(false));
  };

  const handleCreateNew = () => {
    setEditingId(null);
    setFormData({ title: '', slug: '', excerpt: '', image_url: '', content: '', status: 'draft' });
    setShowForm(true);
    setMessage('');
  };

  const handleEdit = (slug) => {
    setMessage('Loading post data...');
    fetch(`http://localhost/aamya_holiday/backend/public/api/blog/${slug}`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          const post = data.data;
          setFormData({
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt || '',
            image_url: post.image_url || '',
            content: post.content,
            status: post.status
          });
          setEditingId(post.id);
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
    setMessage('Saving post...');
    try {
      const payload = { ...formData };
      if (editingId) payload.id = editingId;

      const res = await fetch('http://localhost/aamya_holiday/backend/public/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (data.status === 'success') {
        setMessage('Blog saved successfully!');
        fetchBlogs();
        setTimeout(() => { setShowForm(false); setMessage(''); }, 1500);
      } else {
        setMessage(data.message || 'Error saving blog');
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
            <h1 className="text-3xl font-extrabold text-slate-900">Travel Blog Editor</h1>
            <p className="text-slate-500 font-medium mt-1">Write captivating stories, guides, and marketing content.</p>
          </div>
          {!showForm && (
            <button onClick={handleCreateNew} className="bg-teal-600 hover:bg-teal-500 text-white font-extrabold px-6 py-3 rounded-xl shadow-lg transition transform hover:-translate-y-1">
                + Write New Article
            </button>
          )}
        </header>

        {showForm ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 w-full">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                <h2 className="text-2xl font-bold text-slate-800">{editingId ? 'Edit Article' : 'Draft New Article'}</h2>
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
                        <label className="block text-sm font-bold text-slate-700 mb-2">Article Headline</label>
                        <input required type="text" value={formData.title} onChange={handleTitleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 outline-none font-medium" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">URL Slug</label>
                        <div className="flex items-center">
                            <span className="bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl px-4 py-3 text-slate-500 font-mono text-sm">/blog/</span>
                            <input required type="text" value={formData.slug} onChange={e => setFormData({...formData, slug: generateSlug(e.target.value)})} className="flex-1 bg-slate-50 border border-slate-200 rounded-r-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 outline-none font-mono text-sm" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <ImageUploader 
                            label="Cover Image" 
                            value={formData.image_url} 
                            onChange={url => setFormData({...formData, image_url: url})} 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Quick Excerpt (appears on grids)</label>
                        <input type="text" value={formData.excerpt} onChange={e => setFormData({...formData, excerpt: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 outline-none font-medium text-sm" />
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-6 max-w-full">
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                      <label className="block text-sm font-bold text-slate-700">Full Content</label>
                    </div>
                    <ReactQuill 
                        theme="snow"
                        value={formData.content} 
                        onChange={val => setFormData({...formData, content: val})} 
                        className="w-full max-w-full [&_.ql-editor]:min-h-[300px] [&_.ql-editor]:break-words [&_.ql-container]:border-none [&_.ql-toolbar]:border-none [&_.ql-toolbar]:bg-slate-50 [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-slate-200"
                    />
                </div>

                <div className="flex items-center gap-3 pt-2">
                    <input type="checkbox" id="publish" checked={formData.status === 'published'} onChange={e => setFormData({...formData, status: e.target.checked ? 'published' : 'draft'})} className="w-5 h-5 text-teal-600 rounded bg-slate-100 border-slate-300 focus:ring-teal-500 focus:ring-2" />
                    <label htmlFor="publish" className="font-bold text-slate-700 select-none">Publish immediately (Live to public)</label>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button type="submit" className="bg-teal-600 hover:bg-teal-500 text-white font-extrabold px-8 py-4 rounded-xl shadow-lg transition transform hover:-translate-y-1">
                        {editingId ? 'Update Article' : 'Save Article'}
                    </button>
                </div>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-8 py-4 text-left text-xs font-extrabold text-slate-500 uppercase tracking-widest">Headline</th>
                  <th className="px-6 py-4 text-left text-xs font-extrabold text-slate-500 uppercase tracking-widest">URL Slug</th>
                  <th className="px-6 py-4 text-left text-xs font-extrabold text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-extrabold text-slate-500 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {loading ? (
                    <tr><td colSpan="4" className="text-center py-10 text-slate-400 font-bold tracking-wide">Loading blog...</td></tr>
                ) : blogs.length > 0 ? (
                  blogs.map(post => (
                    <tr key={post.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-8 py-5 whitespace-nowrap text-sm font-extrabold text-slate-900 flex items-center gap-4">
                        <img src={post.image_url || 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=200'} className="w-12 h-12 rounded-lg object-cover shadow-sm" alt="Cover" />
                        {post.title}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm font-mono text-slate-500">/blog/{post.slug}</td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full uppercase tracking-wider ${post.status === 'published' ? 'bg-teal-100 text-teal-700' : 'bg-slate-200 text-slate-600'}`}>
                          {post.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-bold">
                        <a href={`/blog/${post.slug}`} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-indigo-600 mr-4 transition-colors">View</a>
                        <button onClick={() => handleEdit(post.slug)} className="text-teal-600 hover:text-teal-800 transition-colors">Edit</button>
                      </td>
                    </tr>
                  ))
                ) : (
                    <tr><td colSpan="4" className="text-center py-12 text-slate-400">
                        <p className="font-bold text-lg mb-2">No articles written.</p>
                        <p className="text-sm">Click the green button above to start your travel marketing content.</p>
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

export default AdminBlog;
