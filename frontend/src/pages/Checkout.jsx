import { useEffect, useState, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CreditCard, Calendar, Users, ShieldCheck, ArrowLeft } from 'lucide-react';

const Checkout = () => {
  const { slug } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Checkout State
  const [guests, setGuests] = useState(2);
  const [date, setDate] = useState('');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // If user is not logged in, redirect to login with a returnUrl parameter or just redirect for now
    if (!user) {
      navigate('/login');
      return;
    }

    fetch(`http://localhost/aamya_holiday/backend/public/api/packages/${slug}`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setPkg(data.data);
          // Set default date to 2 weeks from now
          const d = new Date();
          d.setDate(d.getDate() + 14);
          setDate(d.toISOString().split('T')[0]);
        }
      })
      .finally(() => setLoading(false));
  }, [slug, user, navigate]);

  const subtotal = pkg ? guests * pkg.price : 0;
  const taxes = subtotal * 0.1; // 10% tax
  const total = subtotal + taxes;

  const handlePayment = async (e) => {
    e.preventDefault();
    setProcessing(true);
    
    try {
        const payload = {
            user_id: user.id,
            package_id: pkg.id,
            check_in_date: date,
            guests: guests,
            primary_guest_name: user?.name || 'Guest',
            total_amount: total
        };

        const res = await fetch('http://localhost/aamya_holiday/backend/public/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        
        if (res.ok && data.status === 'success') {
            setSuccess(true);
        } else {
            console.error('Booking failed:', data.message);
            alert('Failed to process booking. Please try again.');
        }
    } catch (err) {
        console.error('Error during checkout:', err);
        alert('Connection error. Please try again.');
    } finally {
        setProcessing(false);
    }
  };

  if (loading) return <div className="text-center py-32"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-teal-600 border-opacity-50 mx-auto"></div></div>;
  if (!pkg) return <div className="text-center py-32 text-red-500 font-bold text-2xl">Package not found.</div>;

  if (success) {
      return (
          <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-20">
              <div className="bg-white p-10 md:p-16 rounded-[2.5rem] shadow-2xl max-w-2xl text-center border border-slate-100 animate-in zoom-in-95 duration-500">
                  <div className="w-24 h-24 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 mx-auto mb-8 shadow-inner">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Booking Confirmed!</h1>
                  <p className="text-lg text-slate-500 mb-8 font-light">
                      Your luxurious journey to <strong className="text-slate-900">{pkg.destination_name}</strong> is completely secured. We've sent the detailed itinerary and receipt to your email.
                  </p>
                  <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-center mb-10 text-left gap-4 sm:gap-0">
                      <div>
                          <span className="text-xs uppercase font-bold text-slate-400 block tracking-widest mb-1">Confirmation Number</span>
                          <span className="text-xl font-bold text-slate-900 bg-teal-50 px-3 py-1 rounded text-teal-700 font-mono tracking-widest">AH-{Math.floor(Math.random() * 900000) + 100000}</span>
                      </div>
                      <div className="sm:text-right">
                          <span className="text-xs uppercase font-bold text-slate-400 block tracking-widest mb-1">Total Paid</span>
                          <span className="text-xl font-black text-slate-900">₹{total.toLocaleString()}</span>
                      </div>
                  </div>
                  <Link to="/profile" className="inline-block bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-5 px-10 rounded-2xl shadow-xl transform transition hover:-translate-y-1 w-full sm:w-auto">
                      Go to Dashboard
                  </Link>
              </div>
          </div>
      );
  }

  return (
    <div className="bg-slate-50 min-h-screen pt-24 pb-20">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        
        <Link to={`/packages/${pkg.slug}`} className="inline-flex items-center gap-2 text-slate-500 hover:text-teal-600 font-bold mb-8 transition">
          <ArrowLeft className="w-5 h-5"/> Back to Package
        </Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Column: Form & Details */}
            <div className="lg:col-span-7 space-y-8">
                <div>
                   <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Secure Checkout</h1>
                   <p className="text-slate-500 mt-2 font-medium">Complete your reservation for {pkg.title}.</p>
                </div>

                {/* Trip Details Card */}
                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-bl-[5rem] -z-10"></div>
                    <h2 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">Trip Details</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs uppercase font-bold tracking-widest text-slate-500 mb-2">Check-in Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-teal-600" />
                                <input 
                                    type="date" 
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-teal-500 font-bold text-slate-800"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs uppercase font-bold tracking-widest text-slate-500 mb-2">Number of Guests</label>
                            <div className="relative">
                                <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-teal-600" />
                                <input 
                                    type="number"
                                    min="1" 
                                    max="20"
                                    value={guests}
                                    onChange={(e) => setGuests(parseInt(e.target.value))}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-teal-500 font-bold text-slate-800"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Traveler Info */}
                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200">
                    <h2 className="text-xl font-extrabold text-slate-900 mb-6 border-b border-slate-100 pb-4">Primary Traveler</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs uppercase font-bold tracking-widest text-slate-500 mb-2">First Name</label>
                            <input type="text" defaultValue={user?.name.split(' ')[0]} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 outline-none focus:ring-2 focus:ring-teal-500 font-medium text-slate-800" placeholder="First Name" />
                        </div>
                        <div>
                            <label className="block text-xs uppercase font-bold tracking-widest text-slate-500 mb-2">Last Name</label>
                            <input type="text" defaultValue={user?.name.split(' ')[1] || ''} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 outline-none focus:ring-2 focus:ring-teal-500 font-medium text-slate-800" placeholder="Last Name" />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-xs uppercase font-bold tracking-widest text-slate-500 mb-2">Email Address</label>
                            <input type="email" defaultValue={user?.email} disabled className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-4 outline-none text-slate-500 font-medium cursor-not-allowed" />
                            <p className="text-xs text-slate-400 mt-2 font-medium">Receipts will be sent to this email.</p>
                        </div>
                    </div>
                </div>

                {/* Payment Demo */}
                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200 overflow-hidden relative">
                     <div className="absolute top-8 right-8 text-slate-200">
                        <CreditCard className="w-20 h-20 opacity-20" />
                     </div>
                     <h2 className="text-xl font-extrabold text-slate-900 mb-6 border-b border-slate-100 pb-4 flex items-center gap-2">Payment <ShieldCheck className="w-5 h-5 text-teal-500" /></h2>
                     
                     <form onSubmit={handlePayment} className="space-y-6 relative z-10">
                        <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group">
                           <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-2xl group-hover:bg-teal-500/20 transition duration-700"></div>
                           <label className="block text-xs uppercase font-bold tracking-widest text-slate-400 mb-3">Card Details</label>
                           <input type="text" placeholder="0000 0000 0000 0000" required className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-4 mb-4 outline-none focus:border-teal-400 text-white font-mono tracking-widest text-lg placeholder-white/30" />
                           
                           <div className="grid grid-cols-2 gap-4">
                              <input type="text" placeholder="MM/YY" required className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 outline-none focus:border-teal-400 text-white font-mono placeholder-white/30" />
                              <input type="text" placeholder="CVC" required className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 outline-none focus:border-teal-400 text-white font-mono placeholder-white/30" />
                           </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={processing}
                            className={`w-full py-5 rounded-2xl font-extrabold text-lg shadow-xl transform transition-all flex items-center justify-center gap-3 ${processing ? 'bg-slate-300 text-slate-500 cursor-not-allowed scale-100' : 'bg-teal-600 text-white hover:bg-teal-500 hover:-translate-y-1 hover:shadow-teal-600/30'}`}
                        >
                            {processing ? (
                                <><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div> Processing Payment...</>
                            ) : (
                                `Pay ₹${total.toLocaleString()}`
                            )}
                        </button>
                     </form>
                </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-5 relative">
                <div className="bg-white rounded-[2rem] shadow-xl border border-slate-200 sticky top-32 overflow-hidden">
                    {/* Img Header */}
                    <div className="h-48 relative">
                        <img src={pkg.image_url || "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800&fit=crop"} alt={pkg.title} className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
                        <div className="absolute bottom-6 left-6 right-6">
                            <span className="text-teal-400 font-bold text-xs uppercase tracking-widest bg-black/50 backdrop-blur px-2 py-1 rounded inline-block mb-1">{pkg.destination_name}</span>
                            <h3 className="text-xl font-extrabold text-white leading-tight drop-shadow-md">{pkg.title}</h3>
                        </div>
                    </div>
                    
                    <div className="p-8">
                        <div className="flex justify-between items-center mb-6 pb-6 border-b border-dashed border-slate-200">
                            <div>
                                <p className="text-sm font-bold text-slate-500">{pkg.days} Days / {pkg.nights} Nights</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs uppercase font-bold text-slate-400">Price per person</p>
                                <p className="text-lg font-black text-slate-900">₹{pkg.price}</p>
                            </div>
                        </div>

                        <ul className="space-y-4 mb-6 text-sm font-medium text-slate-600">
                            <li className="flex justify-between">
                                <span>{guests} x Guests</span>
                                <span className="text-slate-900">₹{subtotal.toLocaleString()}</span>
                            </li>
                            <li className="flex justify-between">
                                <span>Taxes & Fees (10%)</span>
                                <span className="text-slate-900">₹{taxes.toLocaleString()}</span>
                            </li>
                        </ul>

                        <div className="border-t-2 border-slate-900 pt-6 flex justify-between items-end pb-4">
                            <div>
                                <h4 className="text-2xl font-black text-slate-900">Total</h4>
                                <p className="text-xs font-bold text-slate-400">Includes all taxes</p>
                            </div>
                            <span className="text-4xl font-black text-teal-600">₹{total.toLocaleString()}</span>
                        </div>
                        
                        <div className="bg-teal-50 p-4 rounded-xl flex items-start gap-3 mt-4">
                            <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                            <p className="text-xs font-bold text-teal-800 leading-relaxed">
                                You are on a secure 256-bit encrypted connection. By clicking Pay, you agree to the <a href="#" className="underline">Terms & Conditions</a>.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default Checkout;
