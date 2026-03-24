import { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const PackageDetails = () => {
  const { slug } = useParams();
  const { user } = useContext(AuthContext);
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // CRM Lead State
  const [inquiryData, setInquiryData] = useState({ name: '', email: '', phone: '', message: '' });
  const [showInquireModal, setShowInquireModal] = useState(false);
  const [submittingInquiry, setSubmittingInquiry] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);
  const [inquiryError, setInquiryError] = useState('');

  useEffect(() => {
    fetch(`${(window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')) ? 'http://localhost/aamya_holiday/backend/public/api' : '/backend/public/api'}/packages/${slug}`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setPkg(data.data);
        } else {
          setError(data.message || 'Package not found');
        }
      })
      .catch(err => {
        console.error("Error fetching package details:", err);
        setError('Connection error');
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const handleInquiryChange = (e) => {
    setInquiryData({ ...inquiryData, [e.target.name]: e.target.value });
  };

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    setSubmittingInquiry(true);
    setInquiryError('');
    setInquirySuccess(false);

    try {
      const payload = {
          package_id: pkg.id,
          customer_name: inquiryData.name,
          customer_email: inquiryData.email,
          customer_phone: inquiryData.phone,
          message: inquiryData.message
      };

      const res = await fetch(((window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')) ? 'http://localhost/aamya_holiday/backend/public/api/leads' : '/backend/public/api/leads'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok && data.status === 'success') {
          setInquirySuccess(true);
          setInquiryData({ name: '', email: '', phone: '', message: '' });
          setTimeout(() => setShowInquireModal(false), 3000); // Auto close
      } else {
          setInquiryError(data.message || 'Failed to submit inquiry.');
      }
    } catch (err) {
      setInquiryError('Connection error. Please try again.');
    } finally {
      setSubmittingInquiry(false);
    }
  };

  const handleFavorite = async () => {
      if (!user) {
          alert('Please sign in to save packages to your wishlist.');
          return;
      }
      try {
          const res = await fetch(((window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')) ? 'http://localhost/aamya_holiday/backend/public/api/favorites' : '/backend/public/api/favorites'), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ user_id: user.id, item_type: 'package', item_id: pkg.id })
          });
          const data = await res.json();
          if (res.ok && data.status === 'success') {
              alert(data.message === 'Added to favorites.' ? '❤️ Added to saved destinations!' : 'Removed from saved destinations.');
          }
      } catch(e) {
          console.error("Error toggling favorite", e);
      }
  };

  if (loading) {
    return <div className="text-center py-32"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-teal-600 border-opacity-50 mx-auto"></div></div>;
  }

  if (error || !pkg) {
    return <div className="text-center py-32 text-red-500 font-bold text-2xl bg-slate-50 min-h-screen">{error}</div>;
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      {/* Dynamic Cinematic Hero */}
      <div className="relative h-[70vh] w-full flex items-end">
          <div className="absolute inset-0 z-0 bg-slate-200">
              <img 
                  src="https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=1920&h=1080&fit=crop" 
                  alt={pkg.title} 
                  className="w-full h-full object-cover" 
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent p-12 h-2/3"></div>
          </div>
          
          <div className="relative z-10 w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16 w-full flex flex-col items-start gap-4">
              <nav className="text-xs font-bold uppercase tracking-widest text-slate-300 drop-shadow-md flex items-center gap-2">
                  <Link to="/packages" className="hover:text-teal-400 transition">Tours</Link>
                  <span>/</span>
                  <Link to={`/destinations`} className="hover:text-teal-400 transition">{pkg.destination_name}</Link>
              </nav>
              <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight drop-shadow-xl max-w-4xl">
                  {pkg.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 mt-4">
                  <span className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-white font-bold tracking-wide shadow-sm border border-white/20">
                      ⏱ {pkg.days} Days / {pkg.nights} Nights
                  </span>
                  <span className="bg-teal-600 px-4 py-2 rounded-xl text-white font-bold tracking-wide shadow-sm">
                      📍 {pkg.destination_name}
                  </span>
                  <button 
                    onClick={handleFavorite}
                    className="ml-auto bg-white/20 backdrop-blur-md border border-white/30 p-3 rounded-full shadow-sm hover:bg-white transition text-white hover:text-red-500 group flex items-center justify-center focus:outline-none"
                    title="Save to Wishlist"
                  >
                    <Heart className="w-5 h-5 group-hover:fill-current transition-colors" />
                  </button>
              </div>
          </div>
      </div>

      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Content Pane Left side */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Nav Page Jumps */}
            <div className="bg-white rounded-2xl p-2 shadow-sm border border-slate-100 flex gap-2 overflow-x-auto sticky top-24 z-30">
                <a href="#overview" className="px-6 py-3 rounded-xl hover:bg-slate-50 font-bold text-slate-700 whitespace-nowrap">Overview</a>
                <a href="#itinerary" className="px-6 py-3 rounded-xl hover:bg-slate-50 font-bold text-slate-700 whitespace-nowrap">Itinerary</a>
                <a href="#inclusions" className="px-6 py-3 rounded-xl hover:bg-slate-50 font-bold text-slate-700 whitespace-nowrap">Inclusions</a>
            </div>

            <section id="overview" className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-slate-100">
              <h2 className="text-3xl font-extrabold text-slate-900 mb-6 drop-shadow-sm">The Experience</h2>
              <p className="text-lg text-slate-600 leading-relaxed font-light">
                Immerse yourself in deeply authentic experiences tailored to bring you closer to the heart of {pkg.destination_name}. 
                This signature {pkg.days}-day itinerary unlocks access to hidden gems, 5-star accommodations, and world-class culinary adventures that redefine standard travel.
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.
              </p>
            </section>

            <section id="itinerary" className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-slate-100 overflow-hidden relative">
              <div className="absolute right-0 top-0 w-64 h-64 bg-teal-50 rounded-bl-[10rem] -z-10"></div>
              <div className="flex justify-between items-center mb-8 mt-5 md:mt-0">
                <h2 className="text-3xl font-extrabold text-slate-900">Route Highlights</h2>
              </div>
              <div className="space-y-6">
                {/* Mocked Days layout */}
                {[...Array(parseInt(pkg.days))].map((_, i) => (
                  <div key={i} className="flex gap-4 sm:gap-6 border border-slate-100 p-6 rounded-2xl hover:shadow-md transition bg-slate-50 group">
                    <div className="flex-shrink-0 w-16 h-16 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors duration-300">
                        <span className="text-[10px] uppercase font-bold text-slate-400 group-hover:text-teal-200 tracking-widest outline-none">Day</span>
                        <span className="text-xl font-black text-slate-800 group-hover:text-white">{i + 1}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">Exclusive Site Visit & Leisure</h3>
                      <p className="text-slate-500 font-light leading-snug">Private transfer, welcome reception, guided city excursion, and evening at leisure.</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </div>

          {/* Right Sidebar Widget - Floating Booking Info */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-3xl rounded-[2rem] p-8 shadow-2xl border border-white sticky top-32 z-20">
              <div className="text-center border-b border-slate-100 pb-6 mb-6">
                 <span className="text-xs uppercase font-bold tracking-widest text-slate-400 block mb-2">Reserve Your Spot</span>
                 <div className="flex justify-center items-end gap-1">
                     <span className="text-2xl font-bold text-slate-400">₹</span>
                     <span className="text-5xl font-black text-slate-900 tracking-tight leading-none">{pkg.price}</span>
                     <span className="text-lg font-bold text-slate-500 mb-1">/pp</span>
                 </div>
              </div>
              
              <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3 text-slate-600 font-medium">
                      <div className="p-2 bg-teal-50 rounded-lg text-teal-600">✓</div> VIP Airport Transfers
                  </li>
                  <li className="flex items-center gap-3 text-slate-600 font-medium">
                      <div className="p-2 bg-teal-50 rounded-lg text-teal-600">✓</div> Luxury Accommodations
                  </li>
                  <li className="flex items-center gap-3 text-slate-600 font-medium">
                      <div className="p-2 bg-teal-50 rounded-lg text-teal-600">✓</div> Expert Private Guides
                  </li>
                  <li className="flex items-center gap-3 text-slate-600 font-medium">
                      <div className="p-2 bg-teal-50 rounded-lg text-teal-600">✓</div> Signature Dining Experiences
                  </li>
              </ul>

              <div className="flex flex-col gap-4">
                  <Link 
                    to={`/checkout/${pkg.slug}`} 
                    className="w-full py-5 bg-teal-600 text-white font-extrabold text-lg rounded-2xl hover:bg-teal-500 shadow-xl shadow-teal-500/20 transform hover:-translate-y-1 transition duration-300 flex items-center justify-center gap-2"
                  >
                    Secure Booking <span>&rarr;</span>
                  </Link>
                  <button 
                    onClick={() => setShowInquireModal(true)} 
                    className="w-full py-4 bg-slate-100 text-slate-700 font-bold text-md rounded-2xl hover:bg-slate-200 transition duration-300 flex items-center justify-center gap-2"
                  >
                    Inquire & Customize
                  </button>
              </div>
              
              <p className="text-center text-xs text-slate-400 mt-6 font-medium">
                No payment required to submit a booking inquiry. Our concierge builds your exact quote.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Modern High-End CRM Inquiry Modal */}
      {showInquireModal && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end md:justify-center items-center p-0 md:p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity animate-in fade-in" onClick={() => setShowInquireModal(false)}></div>
          
          <div className="bg-white w-full max-w-lg rounded-t-[2rem] md:rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative z-10 animate-in slide-in-from-bottom-8 md:zoom-in-95 duration-300">
            <button 
              onClick={() => setShowInquireModal(false)}
              className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition"
            >
              ✕
            </button>
            
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Let's craft your journey.</h2>
            <p className="text-slate-500 mb-8 font-light leading-relaxed">
              Connect with our concierge team about the <span className="font-bold text-teal-600">{pkg.title}</span> tour. We reply within 2 hours.
            </p>

            {inquirySuccess ? (
              <div className="bg-teal-50 border border-teal-100 p-6 rounded-2xl text-center">
                  <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">✨</div>
                  <h3 className="text-xl font-bold text-teal-800 mb-2">Inquiry Delivered.</h3>
                  <p className="text-teal-600 font-medium">Aamya concierge has received your request. We will be in touch shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="space-y-5">
                {inquiryError && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100">{inquiryError}</div>}
                
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Full Legal Name</label>
                  <input type="text" required name="name" value={inquiryData.name} onChange={handleInquiryChange} className="w-full bg-slate-50 border-none px-4 py-4 rounded-xl shadow-inner focus:ring-2 focus:ring-teal-500 focus:bg-white transition text-slate-800 font-medium" placeholder="First and Last Name" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Email Address</label>
                      <input type="email" required name="email" value={inquiryData.email} onChange={handleInquiryChange} className="w-full bg-slate-50 border-none px-4 py-4 rounded-xl shadow-inner focus:ring-2 focus:ring-teal-500 focus:bg-white transition text-slate-800 font-medium" placeholder="you@email.com" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Phone Number</label>
                      <input type="tel" required name="phone" value={inquiryData.phone} onChange={handleInquiryChange} className="w-full bg-slate-50 border-none px-4 py-4 rounded-xl shadow-inner focus:ring-2 focus:ring-teal-500 focus:bg-white transition text-slate-800 font-medium" placeholder="+1234567890" />
                    </div>
                </div>
                
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Specific Requirements</label>
                  <textarea name="message" rows="3" value={inquiryData.message} onChange={handleInquiryChange} className="w-full bg-slate-50 border-none px-4 py-4 rounded-xl shadow-inner focus:ring-2 focus:ring-teal-500 focus:bg-white transition text-slate-800 font-medium" placeholder="Number of guests, special diets, or specific VIP requests..."></textarea>
                </div>
                
                <button type="submit" disabled={submittingInquiry} className="w-full group bg-slate-900 hover:bg-teal-600 text-white py-5 rounded-2xl font-extrabold text-lg transition duration-300 flex items-center justify-center gap-2 mt-2 shadow-xl hover:shadow-teal-500/30">
                  {submittingInquiry ? 'Sending Securely...' : 'Submit Inquiry directly to Concierge'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PackageDetails;
