import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Stays = () => {
  const [stays, setStays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(((window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')) ? 'http://localhost/aamya_holiday/backend/public/api/stays' : '/backend/public/api/stays'))
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setStays(data.data);
        }
      })
      .catch(err => console.error("Error fetching stays:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen pt-24 pb-16">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-teal-600 font-bold tracking-widest uppercase text-sm mb-4 block">Luxury Accommodations</span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
            Exceptional Stays
          </h1>
          <p className="text-xl text-slate-500 font-light">
            Discover our curated collection of five-star hotels, exclusive resorts, and private villas around the globe.
          </p>
        </div>

        {/* Filters Bar Mock */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap gap-4 mb-12 items-center justify-between">
            <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                <button className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-lg whitespace-nowrap shadow-md">All Stays</button>
                <button className="px-6 py-2.5 bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold rounded-lg whitespace-nowrap transition">Resorts</button>
                <button className="px-6 py-2.5 bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold rounded-lg whitespace-nowrap transition">Villas</button>
                <button className="px-6 py-2.5 bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold rounded-lg whitespace-nowrap transition">Boutique</button>
            </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stays.length > 0 ? stays.map(stay => (
              <div key={stay.id} className="group bg-white rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-300 border border-slate-100 flex flex-col overflow-hidden transform hover:-translate-y-1">
                {/* Image Area */}
                <div className="relative h-64 bg-slate-200 overflow-hidden">
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/80 to-transparent p-6 z-10 h-1/2"></div>
                    <img 
                        src={stay.image_url || `https://images.unsplash.com/photo-1542314831-c6a4d14d837e?w=800&fit=crop`} 
                        alt={stay.name} 
                        className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition duration-700 ease-in-out"
                    />
                    <div className="absolute top-4 right-4 z-20">
                        <span className="bg-white/95 backdrop-blur-sm text-slate-900 text-xs font-black px-4 py-2 rounded-xl shadow-md uppercase tracking-wide flex items-center gap-1">
                            ★ {stay.rating}
                        </span>
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-6 md:p-8 flex-1 flex flex-col relative z-20 bg-white">
                  <span className="text-xs font-bold text-teal-500 uppercase tracking-widest mb-2 block">{stay.location}</span>
                  <h2 className="text-2xl font-extrabold text-slate-900 mb-3 leading-tight group-hover:text-teal-600 transition-colors">
                    {stay.name}
                  </h2>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                      {stay.amenities && stay.amenities.slice(0, 3).map((amenity, idx) => (
                          <span key={idx} className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded-md">{amenity.trim()}</span>
                      ))}
                      {stay.amenities && stay.amenities.length > 3 && (
                          <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded-md">+{stay.amenities.length - 3}</span>
                      )}
                  </div>

                  <div className="mt-auto pt-6 border-t border-slate-100 flex items-end justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-widest font-bold text-slate-400 block mb-1">From</p>
                      <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-black text-slate-900">₹{stay.price_per_night}</span>
                          <span className="text-sm font-medium text-slate-500">/ night</span>
                      </div>
                    </div>
                    <Link 
                      to={`/stays/${stay.slug}`} 
                      className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-teal-600 transition-colors"
                    >
                      View Property
                    </Link>
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-300 rounded-3xl">
                <p className="text-slate-500 text-lg font-medium">No stays found. Check back later.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Stays;
