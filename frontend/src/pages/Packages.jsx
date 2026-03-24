import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

const Packages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const search = searchParams.get('search') || '';

  useEffect(() => {
    fetch('http://localhost/aamya_holiday/backend/public/api/packages')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setPackages(data.data);
        }
      })
      .catch(err => console.error("Error fetching packages:", err))
      .finally(() => setLoading(false));
  }, []);

  const filteredPackages = packages.filter(pkg => {
    if (!search) return true;
    const lowerSearch = search.toLowerCase();
    return (
      (pkg.title && pkg.title.toLowerCase().includes(lowerSearch)) ||
      (pkg.destination_name && pkg.destination_name.toLowerCase().includes(lowerSearch))
    );
  });

  return (
    <div className="bg-slate-50 min-h-screen pt-24 pb-16">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-teal-600 font-bold tracking-widest uppercase text-sm mb-4 block">Curated Itineraries</span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
            Find Your Perfect Escape
          </h1>
          <p className="text-xl text-slate-500 font-light">
            Browse our exclusive collection of luxury tours and private expeditions.
          </p>
        </div>

        {/* Filters Bar (Mock UI for UX completeness) */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap gap-4 mb-12 items-center justify-between">
            <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                <button className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-lg whitespace-nowrap shadow-md">All Packages</button>
                <button className="px-6 py-2.5 bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold rounded-lg whitespace-nowrap transition">Beach & Resort</button>
                <button className="px-6 py-2.5 bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold rounded-lg whitespace-nowrap transition">Mountain & Ski</button>
                <button className="px-6 py-2.5 bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold rounded-lg whitespace-nowrap transition">Cultural</button>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
                <span className="text-sm font-bold text-slate-500">Sort by:</span>
                <select className="bg-transparent font-bold text-slate-900 border-none outline-none cursor-pointer">
                    <option>Recommended</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                </select>
            </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPackages.length > 0 ? filteredPackages.map(pkg => (
              <div key={pkg.id} className="group bg-white rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-300 border border-slate-100 flex flex-col overflow-hidden transform hover:-translate-y-1">
                {/* Package Image Area */}
                <div className="relative h-64 bg-slate-200 overflow-hidden">
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/80 to-transparent p-6 z-10 h-1/2"></div>
                    <img 
                        src={`https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&fit=crop`} 
                        alt={pkg.title} 
                        className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 group-hover:rotate-1 transition duration-700 ease-in-out"
                    />
                    <div className="absolute top-4 right-4 z-20">
                        <span className="bg-white/95 backdrop-blur-sm text-slate-900 text-xs font-black px-4 py-2 rounded-xl shadow-md uppercase tracking-wide">
                            {pkg.days}D / {pkg.nights}N
                        </span>
                    </div>
                    <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2">
                        <span className="text-xs font-bold text-teal-300 uppercase tracking-widest bg-slate-900/50 backdrop-blur-md px-2 py-1 rounded">
                            {pkg.destination_name}
                        </span>
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-6 md:p-8 flex-1 flex flex-col relative z-20 bg-white">
                  <h2 className="text-2xl font-extrabold text-slate-900 mb-2 leading-tight group-hover:text-teal-600 transition-colors">
                    {pkg.title}
                  </h2>
                  
                  {/* Rating / Meta Mock */}
                  <div className="flex items-center gap-1 mb-6">
                      <span className="text-amber-400 text-sm">★★★★★</span>
                      <span className="text-slate-400 text-xs font-medium ml-1">(4.9/5 Excellent)</span>
                  </div>

                  <div className="mt-auto pt-6 border-t border-slate-100 flex items-end justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-widest font-bold text-slate-400 block mb-1">Starting from</p>
                      <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-black text-slate-900">₹{pkg.price}</span>
                          <span className="text-sm font-medium text-slate-500">/ pp</span>
                      </div>
                    </div>
                    <Link 
                      to={`/packages/${pkg.slug}`} 
                      className="px-6 py-3 bg-teal-50 text-teal-700 font-bold rounded-xl group-hover:bg-teal-600 group-hover:text-white transition-colors flex items-center gap-2"
                    >
                      View Trip
                    </Link>
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-300 rounded-3xl">
                <p className="text-slate-500 text-lg font-medium">No tour packages found matching your criteria. Try a different search.</p>
                {search && (
                   <Link to="/packages" className="inline-block mt-4 text-teal-600 font-bold hover:underline">
                      Clear Search
                   </Link>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Packages;
