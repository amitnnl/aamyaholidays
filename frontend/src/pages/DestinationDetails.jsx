import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

const DestinationDetails = () => {
    const { slug } = useParams();
    const [dest, setDest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch(`http://localhost/aamya_holiday/backend/public/api/destinations/${slug}`)
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') {
                    setDest(data.data);
                } else {
                    setError(data.message);
                }
            })
            .catch(err => {
                console.error("Error:", err);
                setError("Failed to load details");
            })
            .finally(() => setLoading(false));
    }, [slug]);

    if (loading) {
        return <div className="text-center py-32"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div></div>;
    }

    if (error || !dest) {
        return <div className="text-center py-32 text-red-500 font-bold text-2xl">{error || 'Destination not found'}</div>;
    }

    return (
        <div className="bg-slate-50 min-h-screen">
            {/* Hero Section */}
            <div className="relative h-[60vh] bg-slate-900 overflow-hidden flex items-end">
                <img 
                    src={dest.image_url || `https://images.unsplash.com/photo-1504150558240-0b4fd8946624?w=1920&h=800&fit=crop`} 
                    alt={dest.name} 
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900 to-transparent p-12 h-64"></div>
                
                <div className="relative z-10 w-full mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full">
                    <nav className="text-sm text-slate-300 mb-6">
                        <Link to="/destinations" className="hover:text-white transition">Destinations</Link>
                        <span className="mx-2">&gt;</span>
                        <span className="text-white font-bold">{dest.name}</span>
                    </nav>
                    <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-4 drop-shadow-md tracking-tight">{dest.name}</h1>
                </div>
            </div>

            <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-16">
                
                {/* Destination Content */}
                <div className="max-w-3xl mb-16 space-y-6 text-lg text-slate-700 leading-relaxed border-l-4 border-indigo-500 pl-6 bg-white p-8 rounded-r-3xl shadow-sm">
                    <h2 className="text-3xl font-bold text-slate-900 mb-6">About {dest.name}</h2>
                    <p>{dest.description}</p>
                </div>

                <div className="mb-12 border-b border-slate-200 pb-4">
                    <h2 className="text-4xl font-extrabold text-slate-900">Featured Tours in {dest.name}</h2>
                </div>

                {/* Tour Packages List matching the Destination */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {dest.packages && dest.packages.length > 0 ? dest.packages.map(pkg => (
                        <div key={pkg.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300">
                            <div className="h-48 bg-indigo-100 flex items-center justify-center relative">
                                <span className="text-indigo-300 text-5xl font-extrabold rotate-3 opacity-30">Aamya</span>
                                <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded text-sm shadow font-bold text-slate-800">
                                    {pkg.days}D / {pkg.nights}N
                                </div>
                            </div>
                            
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-slate-900 leading-tight mb-4">{pkg.title}</h3>
                                
                                <div className="flex justify-between items-center mt-6">
                                    <div>
                                        <span className="text-xs font-bold text-slate-500 block uppercase tracking-wide">Starting from</span>
                                        <span className="text-2xl font-black text-indigo-600">₹{pkg.price}</span>
                                    </div>
                                    <Link 
                                        to={`/packages/${pkg.slug}`} 
                                        className="px-5 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 transition shadow-md"
                                    >
                                        View Tour &rarr;
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full py-12 px-6 bg-white rounded-2xl text-center border border-dashed border-slate-300">
                            <h3 className="text-xl font-medium text-slate-700 mb-2">No active tours right now</h3>
                            <p className="text-slate-500">We are currently curating the best experiences for {dest.name}. Check back later!</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default DestinationDetails;
