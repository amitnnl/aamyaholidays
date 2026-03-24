import { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { MapPin, Star, User, Calendar, CheckCircle, Wifi, Coffee, Wind, Heart } from 'lucide-react';

const StayDetails = () => {
  const { slug } = useParams();
  const { user } = useContext(AuthContext);
  const [stay, setStay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Booking Widget State
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);

  useEffect(() => {
    fetch(`${(window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')) ? 'http://localhost/aamya_holiday/backend/public/api' : '/backend/public/api'}/stays/${slug}`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setStay(data.data);
          
          // Defaults for booking widget
          const d1 = new Date();
          d1.setDate(d1.getDate() + 7);
          setCheckIn(d1.toISOString().split('T')[0]);
          
          const d2 = new Date();
          d2.setDate(d2.getDate() + 10);
          setCheckOut(d2.toISOString().split('T')[0]);
        } else {
          setError(data.message || 'Stay not found');
        }
      })
      .catch(err => {
        console.error("Error fetching stay details:", err);
        setError('Connection error');
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="text-center py-32"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-teal-600 border-opacity-50 mx-auto"></div></div>;
  if (error || !stay) return <div className="text-center py-32 text-red-500 font-bold text-2xl bg-slate-50 min-h-screen">{error}</div>;

  const calculateNights = () => {
      const d1 = new Date(checkIn);
      const d2 = new Date(checkOut);
      const diffTime = Math.abs(d2 - d1);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 1;
  };

  const handleFavorite = async () => {
      if (!user) {
          alert('Please sign in to save properties to your wishlist.');
          return;
      }
      try {
          const res = await fetch(((window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')) ? 'http://localhost/aamya_holiday/backend/public/api/favorites' : '/backend/public/api/favorites'), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ user_id: user.id, item_type: 'stay', item_id: stay.id })
          });
          const data = await res.json();
          if (res.ok && data.status === 'success') {
              alert(data.message === 'Added to favorites.' ? '❤️ Property added to saved destinations!' : 'Property removed from saved destinations.');
          }
      } catch(e) {
          console.error("Error toggling favorite", e);
      }
  };

  const nights = calculateNights();
  const estimatedTotal = nights * stay.price_per_night;

  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      {/* Header Image grid */}
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 mt-24 mb-10">
          <div className="flex justify-between items-end mb-6">
              <div>
                  <div className="flex items-center gap-2 text-teal-600 font-bold mb-2">
                      <Star className="w-5 h-5 fill-current" />
                      <span>{stay.rating} / 5.0 Featured Property</span>
                  </div>
                  <div className="flex items-center gap-4">
                      <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">{stay.name}</h1>
                      <button 
                        onClick={handleFavorite}
                        className="bg-white border border-slate-200 p-3 rounded-full shadow-sm hover:shadow-md transition text-slate-400 hover:text-red-500 group focus:outline-none"
                      >
                        <Heart className="w-6 h-6 group-hover:fill-current transition-colors" />
                      </button>
                  </div>
                  <span className="flex items-center gap-2 text-slate-500 font-medium mt-3">
                      <MapPin className="w-5 h-5"/> {stay.location}
                  </span>
              </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-4 h-[60vh] rounded-[2rem] overflow-hidden">
             <div className="md:col-span-2 md:row-span-2 relative">
                 <img src={stay.image_url} className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition duration-700" alt={stay.name} />
             </div>
             <div className="relative hidden md:block">
                 <img src="https://images.unsplash.com/photo-1590490360182-c33d57733427?w=500&fit=crop" className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition duration-700" alt="Room" />
             </div>
             <div className="relative hidden md:block rounded-tr-[2rem] overflow-hidden">
                 <img src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500&fit=crop" className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition duration-700" alt="Amenities" />
             </div>
             <div className="md:col-span-2 relative hidden md:block rounded-br-[2rem] overflow-hidden">
                 <img src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&fit=crop" className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition duration-700" alt="Resort View" />
                 <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/80 p-6 flex justify-end">
                     <button className="bg-white/90 backdrop-blur px-6 py-2 rounded-xl font-bold text-slate-900 flex items-center gap-2 shadow-lg">View All Photos</button>
                 </div>
             </div>
          </div>
      </div>

      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Content Pane */}
          <div className="lg:col-span-2 space-y-12">
            
            <section className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-slate-100">
              <h2 className="text-3xl font-extrabold text-slate-900 mb-6 drop-shadow-sm">About this stay</h2>
              <p className="text-lg text-slate-600 leading-relaxed font-light">
                {stay.description}
              </p>
              
              <div className="mt-10 pt-10 border-t border-slate-100">
                  <h3 className="text-2xl font-bold text-slate-900 mb-6">World-Class Amenities</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
                      {stay.amenities && stay.amenities.map((amenity, idx) => (
                          <div key={idx} className="flex items-center gap-3 text-slate-700 font-medium">
                              <CheckCircle className="w-6 h-6 text-teal-500" />
                              {amenity.trim()}
                          </div>
                      ))}
                  </div>
              </div>
            </section>

          </div>

          {/* Right Sidebar - Booking Widget */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-slate-200 sticky top-32 z-20">
              <div className="mb-6 flex items-end justify-between">
                 <div className="flex items-end gap-1">
                     <span className="text-4xl font-black text-slate-900">₹{stay.price_per_night}</span>
                     <span className="text-sm font-bold text-slate-500 mb-1">/night</span>
                 </div>
                 <div className="text-right">
                    <span className="text-xs uppercase font-bold text-slate-400 block tracking-widest">Base Rate</span>
                 </div>
              </div>
              
              <div className="border border-slate-200 rounded-2xl overflow-hidden mb-6 flex flex-col">
                  <div className="flex border-b border-slate-200">
                      <div className="p-4 flex-1 border-r border-slate-200 bg-slate-50 hover:bg-white transition cursor-pointer">
                          <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">Check-in</label>
                          <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="w-full bg-transparent outline-none font-bold text-slate-900 mt-1 cursor-pointer" />
                      </div>
                      <div className="p-4 flex-1 bg-slate-50 hover:bg-white transition cursor-pointer">
                          <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">Check-out</label>
                          <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="w-full bg-transparent outline-none font-bold text-slate-900 mt-1 cursor-pointer" />
                      </div>
                  </div>
                  <div className="p-4 bg-slate-50 hover:bg-white transition cursor-pointer flex items-center justify-between">
                      <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">Guests</label>
                          <span className="font-bold text-slate-900 mt-1 block">{guests} Guests</span>
                      </div>
                      <div className="flex gap-2">
                          <button onClick={() => setGuests(Math.max(1, guests - 1))} className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center hover:bg-slate-200 font-bold">-</button>
                          <button onClick={() => setGuests(guests + 1)} className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center hover:bg-slate-200 font-bold">+</button>
                      </div>
                  </div>
              </div>

              <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center text-slate-600 font-medium">
                      <span className="underline decoration-slate-300 decoration-dashed underline-offset-4">₹{stay.price_per_night} x {nights} nights</span>
                      <span>₹{(stay.price_per_night * nights).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600 font-medium">
                      <span className="underline decoration-slate-300 decoration-dashed underline-offset-4">Resort Fee & Taxes</span>
                      <span>₹{(estimatedTotal * 0.15).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center font-black text-xl text-slate-900 pt-4 border-t border-slate-100 mt-2">
                      <span>Total</span>
                      <span>₹{(estimatedTotal * 1.15).toLocaleString()}</span>
                  </div>
              </div>

              <button 
                className="w-full py-5 bg-teal-600 text-white font-extrabold text-lg rounded-2xl hover:bg-teal-500 shadow-xl shadow-teal-500/20 transform hover:-translate-y-1 transition duration-300 flex items-center justify-center gap-2"
                onClick={() => alert('Hotel reservation mock checkout would launch here.')}
              >
                Reserve Now
              </button>
              
              <p className="text-center text-xs text-slate-400 mt-6 font-medium">
                You won't be charged yet. Instant confirmation upon checkout.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default StayDetails;
