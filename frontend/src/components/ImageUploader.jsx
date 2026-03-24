import { useState } from 'react';

const ImageUploader = ({ value, onChange, label = "Image Upload" }) => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        setError('');

        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await fetch(((window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')) ? 'http://localhost/aamya_holiday/backend/public/api/upload' : '/backend/public/api/upload'), {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            
            if (res.ok && data.status === 'success') {
                onChange(data.url);
            } else {
                setError(data.message || 'Upload failed');
            }
        } catch (err) {
            setError('Network error during upload');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="w-full">
            <label className="block text-sm font-bold text-slate-700 mb-2">{label}</label>
            <div className="flex items-center gap-4">
                {value ? (
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200">
                        <img src={value} alt="Preview" className="w-full h-full object-cover" />
                        <button 
                            type="button" 
                            onClick={() => onChange('')} 
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold"
                        >
                            &times;
                        </button>
                    </div>
                ) : (
                    <div className="w-20 h-20 bg-slate-100 rounded-xl flex items-center justify-center border border-dashed border-slate-300">
                        <span className="text-slate-400 text-xs">No Image</span>
                    </div>
                )}
                
                <div className="flex-1">
                    <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange} 
                        disabled={uploading}
                        className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 transition-colors"
                    />
                    {uploading && <p className="text-teal-600 text-xs mt-2 font-bold animate-pulse">Uploading...</p>}
                    {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
                </div>
            </div>
        </div>
    );
};

export default ImageUploader;
