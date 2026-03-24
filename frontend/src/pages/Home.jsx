
import { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { SettingsContext } from '../context/SettingsContext';

const Home = () => {
  const { settings } = useContext(SettingsContext);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const heroImages = settings?.hero_bg_image 
      ? settings.hero_bg_image.split(',').filter(Boolean) 
      : ["https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1920&h=1080&fit=crop"];

  useEffect(() => {
      const interval = setInterval(() => {
          setCurrentSlide(prev => (prev + 1) % heroImages.length);
      }, 5000); // 5 seconds per slide
      return () => clearInterval(interval);
  }, [heroImages.length]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/packages?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/packages');
    }
  };

  useEffect(() => {
    fetch('http://localhost/aamya_holiday/backend/public/api/destinations')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setDestinations(data.data.slice(0, 4)); // Only show top 4
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white min-h-screen">
      <Helmet>
        <title>{settings?.site_name || 'Aamya Holidays'} | {settings?.hero_heading || 'Travel Beyond Limits'}</title>
        <meta name="description" content={settings?.hero_subheading || 'Curated luxury travel experiences to spectacular destinations.'} />
      </Helmet>
      
      {/* Dynamic Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-slate-900">
        {/* Background Image Slideshow Wrapper */}
        <div className="absolute inset-0 z-0">
          {heroImages.map((imgUrl, idx) => (
             <img 
               key={idx}
               src={imgUrl} 
               alt={`Hero Slide ${idx+1}`} 
               className={`absolute inset-0 w-full h-full object-cover transition-all duration-[2000ms] ease-in-out ${idx === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
             />
          ))}
          {/* Advanced Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-900/50 to-transparent z-10"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 mt-20 max-w-5xl animate-fade-up">
          <span className="text-teal-400 font-black tracking-[0.2em] uppercase text-sm mb-6 block drop-shadow-md">
            {settings?.site_name || "The extraordinary awaits"}
          </span>
          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tight drop-shadow-2xl mb-6 leading-tight">
            {settings?.hero_heading || "Curated Journeys. Unparalleled Luxury."}
          </h1>
          <p className="mt-6 text-xl md:text-2xl text-slate-200 max-w-3xl mx-auto drop-shadow-lg mb-12 font-medium leading-relaxed">
            {settings?.hero_subheading || "We orchestrate flawless itineraries for the modern explorer. Unleash your wanderlust with Aamya Holiday."}
          </p>
          {/* Functional Search Bar */}
          <form onSubmit={handleSearch} className="max-w-4xl mx-auto bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-3xl shadow-2xl flex flex-col md:flex-row items-center gap-4 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <div className="flex-1 w-full bg-white/90 rounded-2xl px-6 py-4 flex items-center gap-3">
              <span className="text-xl">📍</span>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Where do you want to go?" 
                className="w-full bg-transparent outline-none text-slate-800 font-medium placeholder-slate-400" 
              />
            </div>
            <div className="flex-1 w-full bg-white/90 rounded-2xl px-6 py-4 flex items-center gap-3">
              <span className="text-xl">📅</span>
              <input type="date" className="w-full bg-transparent outline-none text-slate-800 font-medium" />
            </div>
            <button type="submit" className="w-full md:w-auto px-10 py-5 bg-teal-600 hover:bg-teal-500 text-white font-extrabold rounded-2xl transition-all shadow-lg transform hover:-translate-y-1">
              Search
            </button>
          </form>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
            <span className="text-white/60 text-xs font-bold uppercase tracking-widest">Scroll Down</span>
            <div className="w-0.5 h-12 bg-white/30 rounded-full overflow-hidden">
                <div className="w-full h-1/2 bg-white rounded-full"></div>
            </div>
        </div>
      </section>

      {/* Popular Destinations Section */}
      <section className="py-24 bg-slate-50 relative">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16">
                <div>
                    <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">Trending Destinations</h2>
                    <p className="mt-4 text-xl text-slate-500 max-w-2xl font-light">
                        Explore our handpicked selection of top-rated locations that travelers are loving right now.
                    </p>
                </div>
                <Link to="/destinations" className="hidden md:inline-flex items-center gap-2 text-teal-600 font-bold hover:text-teal-700 transition group mt-6 md:mt-0">
                    View all destinations
                    <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                </Link>
            </div>

          {loading ? (
             <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
             </div>
          ) : (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {destinations.length > 0 ? destinations.map((dest, index) => (
                    <Link key={dest.id} to={`/destinations/${dest.slug}`} className={`group relative h-96 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 block ${index === 0 ? 'sm:col-span-2 lg:col-span-2' : ''}`}>
                        <img 
                            src={dest.image_url || `https://images.unsplash.com/photo-1542051812871-702206bf207e?w=800&fit=crop`} 
                            alt={dest.name} 
                            className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-110 group-hover:rotate-1 transition duration-700"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent p-8 h-2/3 flex flex-col justify-end">
                            <span className="text-teal-400 font-bold uppercase tracking-wider text-xs mb-2 block transform opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                                Discover
                            </span>
                            <h3 className="text-3xl font-extrabold text-white mb-1 drop-shadow-lg">{dest.name}</h3>
                            <p className="text-slate-300 text-sm line-clamp-2 transform opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-75">
                                {dest.description}
                            </p>
                        </div>
                    </Link>
                )) : (
                    <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-300 rounded-3xl">
                        <p className="text-slate-500 text-xl font-medium">No destinations found. Check back later.</p>
                    </div>
                )}
             </div>
          )}
          
          <div className="mt-8 text-center md:hidden">
            <Link to="/destinations" className="inline-block py-3 px-8 border-2 border-teal-600 text-teal-600 font-bold rounded-full hover:bg-teal-50 transition">
                View All Destinations
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Showcase */}
      <section className="py-24 bg-white">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            <div className="order-2 lg:order-1 relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-teal-100 to-indigo-100 rounded-[3rem] transform -rotate-3 z-0"></div>
                <img 
                    src="https://images.unsplash.com/photo-1522798514336-8e9f46f41426?w=1000&fit=crop" 
                    alt="Premium Travel" 
                    className="relative z-10 rounded-[2.5rem] shadow-2xl object-cover h-[600px] w-full"
                />
                
                {/* Floating Glass Widget */}
                <div className="absolute -bottom-8 -right-8 z-20 bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-white/50 w-64 animate-bounce" style={{ animationDuration: '4s' }}>
                    <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-2xl font-bold text-indigo-600">5</div>
                        <span className="font-extrabold text-slate-800 text-xl">Stars</span>
                    </div>
                    <p className="text-sm font-medium text-slate-500">Voted Best Luxury Travel Agency 2024</p>
                </div>
            </div>

            <div className="order-1 lg:order-2 space-y-8">
                <div>
                    <span className="text-teal-600 font-bold tracking-widest uppercase text-sm mb-2 block">Why Aamya</span>
                    <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">We redefine the art of travel.</h2>
                </div>
                <p className="text-lg text-slate-600 font-light leading-relaxed">
                    Traveling with Aamya means stepping out of the ordinary and into a curated adventure where every detail is meticulously orchestrated. Let us take you on a journey you will never forget.
                </p>

                <div className="space-y-6 pt-4">
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 font-bold text-xl">01</div>
                        <div>
                            <h4 className="text-xl font-bold text-slate-900">Expert Curators</h4>
                            <p className="text-slate-500 mt-1 font-light">Our travel experts hand-pick every hotel, experience, and meal ensuring top-tier quality.</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 font-bold text-xl">02</div>
                        <div>
                            <h4 className="text-xl font-bold text-slate-900">VIP Treatment</h4>
                            <p className="text-slate-500 mt-1 font-light">Skip the lines, upgrade your stays, and experience destinations like true royalty.</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 font-bold text-xl">03</div>
                        <div>
                            <h4 className="text-xl font-bold text-slate-900">24/7 Concierge</h4>
                            <p className="text-slate-500 mt-1 font-light">From before takeoff until you are safely home, we are just one call away.</p>
                        </div>
                    </div>
                </div>
                
                <div className="pt-6">
                    <Link to="/packages" className="inline-block px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg transition transform hover:-translate-y-1">
                        Explore Our Experiences &rarr;
                    </Link>
                </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
