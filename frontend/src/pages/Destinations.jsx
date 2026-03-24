import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Destinations = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost/aamya_holiday/backend/public/api/destinations')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setDestinations(data.data);
        }
      })
      .catch(err => console.error("Error fetching destinations:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white min-h-screen py-16">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight sm:text-6xl mb-4">Discover Extraordinary Places</h1>
          <p className="max-w-2xl mx-auto text-xl text-slate-500">
            From the serene beaches of Bali to the stunning heights of the Swiss Alps, explore our handpicked travel locations.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {destinations.length > 0 ? destinations.map(dest => (
              <Link key={dest.id} to={`/destinations/${dest.slug}`} className="group block">
                <div className="relative h-80 w-full rounded-2xl overflow-hidden shadow-md group-hover:shadow-2xl transition duration-300">
                  {/* Dynamic background gradient placeholder based on ID or using an image if provided */}
                  <div className={`absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-800/40 to-transparent z-10`} />
                  
                  <img 
                    src={dest.image_url || `https://images.unsplash.com/photo-1504150558240-0b4fd8946624?w=600&h=800&fit=crop`} 
                    alt={dest.name} 
                    className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-110 transition duration-700 ease-in-out"
                  />
                  
                  <div className="absolute inset-0 z-20 p-8 flex flex-col justify-end">
                    <h3 className="text-3xl font-bold text-white mb-2">{dest.name}</h3>
                    <p className="text-slate-200 text-sm line-clamp-2 md:line-clamp-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0">
                        {dest.description}
                    </p>
                  </div>
                </div>
              </Link>
            )) : (
               <div className="col-span-full text-center py-12">
                 <p className="text-slate-500 text-lg">More destinations coming soon!</p>
               </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default Destinations;
