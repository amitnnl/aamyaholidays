import { useContext, useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { MapPin, Calendar, Clock, Heart, Search, FileText } from 'lucide-react';

const UserProfile = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('bookings');
  const [myBookings, setMyBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  const [loadingWishlist, setLoadingWishlist] = useState(true);
  
  // Settings Tab State
  const [profileData, setProfileData] = useState({ name: user?.name, email: user?.email, phone: '' });
  const [updateMsg, setUpdateMsg] = useState({ type: '', text: '' });
  const { login } = useContext(AuthContext); // Need to re-auth context when name changes

  useEffect(() => {
    if (user && activeTab === 'bookings') {
      setLoadingBookings(true);
      fetch(`${(window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')) ? 'http://localhost/aamya_holiday/backend/public/api' : '/backend/public/api'}/user/bookings?user_id=${user.id}`)
        .then(res => res.json())
        .then(data => {
            if(data.status === 'success') {
                setMyBookings(data.data);
            }
        })
        .finally(() => setLoadingBookings(false));
    }
    
    if (user && activeTab === 'wishlist') {
      setLoadingWishlist(true);
      fetch(`${(window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')) ? 'http://localhost/aamya_holiday/backend/public/api' : '/backend/public/api'}/user/favorites?user_id=${user.id}`)
        .then(res => res.json())
        .then(data => {
            if(data.status === 'success') {
                setWishlist(data.data);
            }
        })
        .finally(() => setLoadingWishlist(false));
    }
  }, [user, activeTab]);

  // If completely unauthenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleProfileUpdate = async (e) => {
      e.preventDefault();
      setUpdateMsg({ type: 'info', text: 'Updating profile...' });
      try {
          const res = await fetch(((window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')) ? 'http://localhost/aamya_holiday/backend/public/api/auth/update' : '/backend/public/api/auth/update'), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  id: user.id,
                  role: user.role,
                  name: profileData.name,
                  email: profileData.email
              })
          });
          const data = await res.json();
          if (res.ok && data.status === 'success') {
              setUpdateMsg({ type: 'success', text: 'Profile updated successfully!' });
              // Update context safely
              login(data.user);
          } else {
              setUpdateMsg({ type: 'error', text: data.message || 'Update failed.' });
          }
      } catch (err) {
          setUpdateMsg({ type: 'error', text: 'Connection error while updating.' });
      }
  };

  return (
    <div className="bg-slate-50 min-h-screen pt-24 pb-16">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Profile Header */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mb-8">
          <div className="h-48 bg-teal-600 relative">
             {/* Decorative Background */}
             <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=1920&fit=crop')] opacity-20 bg-cover bg-center"></div>
             <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          </div>
          
          <div className="px-8 pb-8 relative">
            <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-16 sm:-mt-20 gap-6 mb-8">
              <div className="w-32 h-32 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center text-5xl font-extrabold text-teal-600 shadow-xl z-10 shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="text-center sm:text-left z-10 w-full">
                <h1 className="text-3xl font-extrabold text-slate-900">{user.name}</h1>
                <p className="text-slate-500 font-medium">{user.email}</p>
                <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-3">
                  <span className="bg-teal-50 text-teal-700 text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider shadow-sm">
                    {user.role} Member
                  </span>
                  <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm">
                    <Calendar className="w-4 h-4" /> Joined recently
                  </span>
                </div>
              </div>
              <div className="z-10 ml-auto hidden md:block">
                 <Link to="/packages" className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-slate-800 transition transform hover:-translate-y-1 flex items-center gap-2">
                    <Search className="w-5 h-5"/> Explore New Trips
                 </Link>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 gap-8 overflow-x-auto">
              <button 
                onClick={() => setActiveTab('bookings')}
                className={`pb-4 font-bold text-lg whitespace-nowrap transition-colors border-b-2 ${activeTab === 'bookings' ? 'border-teal-600 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
              >
                My Bookings
              </button>
              <button 
                onClick={() => setActiveTab('wishlist')}
                className={`pb-4 font-bold text-lg whitespace-nowrap transition-colors border-b-2 ${activeTab === 'wishlist' ? 'border-teal-600 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
              >
                Saved Destinations
              </button>
              <button 
                onClick={() => setActiveTab('settings')}
                className={`pb-4 font-bold text-lg whitespace-nowrap transition-colors border-b-2 ${activeTab === 'settings' ? 'border-teal-600 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
              >
                Account Settings
              </button>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          
          {activeTab === 'bookings' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">Recent Bookings</h2>
               </div>
               
               <div className="grid grid-cols-1 gap-6">
                  {loadingBookings ? (
                     <div className="text-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div></div>
                  ) : myBookings.length > 0 ? myBookings.map(bkg => (
                    <div key={bkg.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row hover:shadow-md transition">
                      <div className="w-full md:w-64 h-48 md:h-auto shrink-0 relative">
                        <img src={bkg.image_url || "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&fit=crop"} alt={bkg.package_name} className="absolute inset-0 w-full h-full object-cover" />
                      </div>
                      <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-4 md:mb-0">
                           <div>
                             <span className="text-xs font-bold text-slate-400 block mb-1">Booking Ref: {bkg.booking_ref}</span>
                             <h3 className="text-xl font-bold text-slate-900 mb-2">{bkg.package_name}</h3>
                             <div className="flex items-center gap-4 text-sm text-slate-600 font-medium">
                               <span className="flex items-center gap-1"><Calendar className="w-4 h-4 text-teal-600"/> {bkg.check_in_date}</span>
                               <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-teal-600"/> {bkg.days} Days / {bkg.guests} Guests</span>
                             </div>
                           </div>
                           <span className={`px-3 py-1 rounded-full text-xs font-bold ${bkg.status === 'Confirmed' ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-600'}`}>
                             {bkg.status}
                           </span>
                        </div>
                        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
                           <div>
                              <span className="text-xs font-bold text-slate-400 block">Total Amount</span>
                              <span className="text-xl font-bold text-slate-900">₹{bkg.total_amount}</span>
                           </div>
                           <a 
                             href={`${(window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')) ? 'http://localhost/aamya_holiday/backend/public/api' : '/backend/public/api'}/pdf/booking/${bkg.booking_ref}`} 
                             target="_blank" 
                             rel="noopener noreferrer" 
                             className="flex items-center gap-2 text-sm font-bold text-teal-600 hover:text-teal-700 hover:bg-teal-50 px-4 py-2 rounded-lg transition"
                           >
                             <FileText className="w-4 h-4" /> View Itinerary PDF
                           </a>
                        </div>
                      </div>
                    </div>
                  )) : (
                     <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-slate-300">
                        <p className="text-slate-500 font-medium pb-4">You have no past or upcoming bookings.</p>
                        <Link to="/packages" className="text-teal-600 font-bold hover:underline">Explore Packages</Link>
                     </div>
                  )}
               </div>
            </div>
          )}

          {activeTab === 'wishlist' && (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">Saved Destinations</h2>
               </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {loadingWishlist ? (
                     <div className="col-span-full py-10 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div></div>
                  ) : wishlist.length > 0 ? wishlist.map(item => (
                    <div key={item.fav_id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 group relative">
                       <div className="relative h-48 rounded-xl overflow-hidden mb-4">
                          <img src={item.image_url} alt={item.name} className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition duration-500" />
                          <button className="absolute top-3 right-3 bg-white p-2 text-teal-500 rounded-full shadow-lg">
                            <Heart className="w-5 h-5 fill-current" />
                          </button>
                       </div>
                       <h3 className="font-bold text-slate-900 text-lg mb-1 truncate">{item.name}</h3>
                       <div className="flex justify-between items-center">
                          <span className="text-slate-500 font-medium line-clamp-1 text-sm">Starting from <strong className="text-slate-900">₹{item.price}</strong></span>
                          <Link to={`/${item.item_type === 'stay' ? 'stays' : 'packages'}/${item.slug}`} className="text-teal-600 text-sm font-bold min-w-max">View details</Link>
                       </div>
                       <div className="absolute top-0 opacity-0">{item.item_id}</div>
                    </div>
                  )) : (
                     <div className="col-span-full text-center py-10 bg-white rounded-2xl border border-dashed border-slate-300">
                        <p className="text-slate-500 font-medium pb-4">You have not saved any destinations yet.</p>
                        <Link to="/packages" className="text-teal-600 font-bold hover:underline">Explore Packages</Link>
                     </div>
                  )}
                </div>
             </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <h3 className="text-xl font-bold text-slate-900 mb-6">Personal Information</h3>
               
               {updateMsg.text && (
                  <div className={`p-4 rounded-xl mb-6 font-bold ${updateMsg.type === 'success' ? 'bg-teal-50 text-teal-700' : updateMsg.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-700'}`}>
                      {updateMsg.text}
                  </div>
               )}

               <form onSubmit={handleProfileUpdate}>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                        <input type="text" value={profileData.name || ''} onChange={(e) => setProfileData({...profileData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition" required />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                        <input type="email" value={profileData.email || ''} onChange={(e) => setProfileData({...profileData, email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition" required />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number</label>
                        <input type="text" value={profileData.phone || ''} onChange={(e) => setProfileData({...profileData, phone: e.target.value})} placeholder="+1 (555) 000-0000" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition" />
                      </div>
                   </div>
                   <button type="submit" className="mt-8 bg-teal-600 text-white font-bold py-3 px-8 rounded-xl shadow-md hover:bg-teal-700 transition">Save Changes</button>
               </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default UserProfile;
