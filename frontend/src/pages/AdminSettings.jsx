import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { SettingsContext } from '../context/SettingsContext';
import { Navigate, Link } from 'react-router-dom';
import ImageUploader from '../components/ImageUploader';
import MultiImageUploader from '../components/MultiImageUploader';

const AdminSettings = () => {
  const { user, logout } = useContext(AuthContext);
  const { settings, refreshSettings } = useContext(SettingsContext);
  
  const [formData, setFormData] = useState({
    site_name: '',
    logo_text: '',
    hero_heading: '',
    hero_subheading: '',
    hero_bg_image: '',
    contact_email: '',
    contact_phone: '',
    whatsapp_number: '',
    footer_text: ''
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (settings) {
      setFormData({
        site_name: settings.site_name || '',
        logo_text: settings.logo_text || '',
        hero_heading: settings.hero_heading || '',
        hero_subheading: settings.hero_subheading || '',
        hero_bg_image: settings.hero_bg_image || '',
        contact_email: settings.contact_email || '',
        contact_phone: settings.contact_phone || '',
        whatsapp_number: settings.whatsapp_number || '',
        footer_text: settings.footer_text || ''
      });
    }
  }, [settings]);

  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const res = await fetch('http://localhost/aamya_holiday/backend/public/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.status === 'success') {
        setMessage('Settings perfectly updated and published globally!');
        refreshSettings(); // Pull down fresh context
      } else {
        setMessage('Failed to update settings.');
      }
    } catch (err) {
      setMessage('Network error. Please try again.');
    } finally {
      setTimeout(() => setMessage(''), 4000);
      setSaving(false);
    }
  };

  return (
    <div className="w-full bg-slate-50">
      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto h-screen bg-slate-50">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Brand & Site Settings</h1>
            <p className="text-slate-500 font-medium mt-1">Control your public-facing platform branding and copy instantly.</p>
          </div>
        </header>

        {message && (
          <div className={`p-4 rounded-xl mb-6 font-bold flex items-center gap-3 ${message.includes('succ') || message.includes('perfect') ? 'bg-teal-50 text-teal-700 border border-teal-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            <span>{message.includes('succ') || message.includes('perfect') ? '✨' : '⚠️'}</span> {message}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden w-full">
            <form onSubmit={handleSubmit} className="p-8 space-y-8">
                
                {/* Global Info */}
                <div>
                    <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">Global Branding</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Company Name (SEO)</label>
                            <input type="text" name="site_name" value={formData.site_name} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:bg-white outline-none transition font-medium" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Header Logo Text</label>
                            <input type="text" name="logo_text" value={formData.logo_text} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:bg-white outline-none transition font-medium" />
                        </div>
                        <div className="md:col-span-2">
                            <ImageUploader 
                                label="Brand Logo Image (Upload to replace default airplane icon)" 
                                value={formData.logo_url} 
                                onChange={url => setFormData({...formData, logo_url: url})} 
                            />
                        </div>
                    </div>
                </div>

                {/* Home Page Hero Customization */}
                <div>
                    <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">Home Page Hero</h3>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Main Headline</label>
                            <input type="text" name="hero_heading" value={formData.hero_heading} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:bg-white outline-none transition font-medium text-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Subheadline</label>
                            <textarea name="hero_subheading" value={formData.hero_subheading} onChange={handleChange} rows="2" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:bg-white outline-none transition font-medium"></textarea>
                        </div>
                        <div className="md:col-span-2">
                            <MultiImageUploader 
                                label="Background Hero SlideShow Images" 
                                value={formData.hero_bg_image} 
                                onChange={url => setFormData({...formData, hero_bg_image: url})} 
                            />
                        </div>
                    </div>
                </div>

                {/* Footer and Contact */}
                <div>
                    <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">Footer & Contact</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Public Email Info</label>
                            <input type="email" name="contact_email" value={formData.contact_email} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:bg-white outline-none transition font-medium" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Public Phone Number</label>
                            <input type="text" name="contact_phone" value={formData.contact_phone} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:bg-white outline-none transition font-medium" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">WhatsApp Number (Optional)</label>
                            <input type="text" name="whatsapp_number" value={formData.whatsapp_number} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition font-medium" placeholder="+1234567890" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Footer About Text</label>
                        <textarea name="footer_text" value={formData.footer_text} onChange={handleChange} rows="2" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:bg-white outline-none transition font-medium"></textarea>
                    </div>
                </div>

                {/* Social Media Links */}
                <div>
                    <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">Social Media Connections</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Facebook URL</label>
                            <input type="url" name="social_facebook" value={formData.social_facebook} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#1877F2] focus:bg-white outline-none transition font-medium" placeholder="https://facebook.com/..." />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Instagram URL</label>
                            <input type="url" name="social_instagram" value={formData.social_instagram} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#E4405F] focus:bg-white outline-none transition font-medium" placeholder="https://instagram.com/..." />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Twitter / X URL</label>
                            <input type="url" name="social_twitter" value={formData.social_twitter} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-slate-800 focus:bg-white outline-none transition font-medium" placeholder="https://twitter.com/..." />
                        </div>
                    </div>
                </div>

                <div className="pt-4 flex justify-end">
                    <button type="submit" disabled={saving} className="bg-teal-600 hover:bg-teal-500 text-white font-extrabold px-8 py-4 rounded-xl shadow-lg shadow-teal-500/30 transition transform hover:-translate-y-1 flex items-center gap-2">
                        {saving ? 'Publishing Locally...' : 'Publish Global Settings'}
                    </button>
                </div>
            </form>
        </div>
      </main>
    </div>
  );
};

export default AdminSettings;
