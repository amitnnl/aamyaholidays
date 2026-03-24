import { useState } from 'react';

const MultiImageUploader = ({ value, onChange, label = "Images Upload" }) => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    // Values could be a comma-separated string 'url1,url2' or empty
    const imageList = value ? value.split(',').filter(Boolean) : [];

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setUploading(true);
        setError('');

        const newUrls = [];

        for (let file of files) {
            const formData = new FormData();
            formData.append('image', file);
            try {
                const res = await fetch(((window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')) ? 'http://localhost/aamya_holiday/backend/public/api/upload' : '/backend/public/api/upload'), {
                    method: 'POST',
                    body: formData
                });
                const data = await res.json();
                if (res.ok && data.status === 'success') {
                    newUrls.push(data.url);
                }
            } catch (err) {
                // Ignore single file error in bulk
            }
        }

        if (newUrls.length > 0) {
            const combined = [...imageList, ...newUrls].join(',');
            onChange(combined);
        } else {
            setError('Failed to upload images.');
        }

        setUploading(false);
        // Reset input
        e.target.value = '';
    };

    const handleRemove = (urlToRemove) => {
        const filtered = imageList.filter(url => url !== urlToRemove).join(',');
        onChange(filtered);
    };

    return (
        <div className="w-full">
            <label className="block text-sm font-bold text-slate-700 mb-2">{label}</label>
            
            <div className="flex flex-wrap gap-4 mb-4">
                {imageList.map((imgUrl, idx) => (
                    <div key={idx} className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-slate-200 shadow-sm group">
                        <img src={imgUrl} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button 
                                type="button" 
                                onClick={() => handleRemove(imgUrl)}
                                className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold shadow-lg hover:scale-110 transition"
                            >
                                &times;
                            </button>
                        </div>
                    </div>
                ))}
                
                <label className={`w-24 h-24 bg-slate-50 border-2 border-dashed border-teal-300 text-teal-600 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-teal-50 transition ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    <span className="text-xs font-bold">{uploading ? 'Wait...' : 'Add'}</span>
                    <input 
                        type="file" 
                        multiple
                        accept="image/*" 
                        onChange={handleFileChange} 
                        disabled={uploading}
                        className="hidden"
                    />
                </label>
            </div>
            {error && <p className="text-red-500 text-xs font-bold">{error}</p>}
        </div>
    );
};

export default MultiImageUploader;
