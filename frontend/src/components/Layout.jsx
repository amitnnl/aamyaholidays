import { useContext, useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { SettingsContext } from '../context/SettingsContext';
import { Menu, X, User, ChevronDown } from 'lucide-react';

const Layout = () => {
  const { user, logout } = useContext(AuthContext);
  const { settings } = useContext(SettingsContext);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50 text-slate-800">
      {/* Header Pipeline */}
      <header className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-lg shadow-sm py-3' : 'bg-transparent py-5'}`}>
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          
          {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              {settings?.logo_url ? (
                <img src={settings.logo_url} alt="Brand Logo" className="h-10 w-auto object-contain rounded drop-shadow-md" />
              ) : (
                <div className="bg-teal-600 text-white p-2 rounded-xl shadow-[0_0_15px_rgba(13,148,136,0.5)]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.6L3 8l5.5 4L5 15.5 2 15l-1 1 4 4 1-1-.5-3 3.5-3.5 4 5.5h1.2l.6-1.8z"/></svg>
                </div>
              )}
              <span className={`text-2xl font-black tracking-tighter ${isScrolled || location.pathname !== '/' ? 'text-slate-900' : 'text-white'}`}>
                {settings?.site_name || "Aamya Holidays"}
              </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/destinations" className={`font-semibold text-sm tracking-wide transition-colors ${isScrolled || location.pathname !== '/' ? 'text-slate-600 hover:text-teal-600' : 'text-slate-100 hover:text-white'}`}>Destinations</Link>
            <Link to="/packages" className={`font-semibold text-sm tracking-wide transition-colors ${isScrolled || location.pathname !== '/' ? 'text-slate-600 hover:text-teal-600' : 'text-slate-100 hover:text-white'}`}>Packages</Link>
            <Link to="/stays" className={`font-semibold text-sm tracking-wide transition-colors ${isScrolled || location.pathname !== '/' ? 'text-slate-600 hover:text-teal-600' : 'text-slate-100 hover:text-white'}`}>Hotels</Link>
            <Link to="/blog" className={`font-semibold text-sm tracking-wide transition-colors ${isScrolled || location.pathname !== '/' ? 'text-slate-600 hover:text-teal-600' : 'text-slate-100 hover:text-white'}`}>Journal</Link>
            
            <div className="h-6 w-px bg-slate-300/50 hidden lg:block"></div>

            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className={`flex items-center gap-2 font-semibold text-sm tracking-wide transition-colors ${isScrolled || location.pathname !== '/' ? 'text-slate-900' : 'text-white'}`}
                >
                  <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                    {user.name.charAt(0)}
                  </div>
                  {user.name}
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-xl py-2 border border-slate-100 animate-in fade-in slide-in-from-top-2">
                    {user.role === 'admin' && (
                      <Link to="/admin" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 font-medium pb-2 border-b border-slate-100">Admin Dashboard</Link>
                    )}
                    <Link to="/profile" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 font-medium">My Account</Link>
                    <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-bold mt-1 border-t border-slate-100 pt-2">Sign out</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-5 ml-4">
                <Link to="/login" className={`font-extrabold text-sm tracking-wide uppercase transition hover:text-teal-400 ${isScrolled || location.pathname !== '/' ? 'text-slate-800' : 'text-white'}`}>Login</Link>
                <Link to="/register" className="bg-teal-600 hover:bg-teal-500 text-white px-6 py-2.5 rounded-full font-bold shadow-[0_0_15px_rgba(13,148,136,0.3)] transition transform hover:-translate-y-0.5">Register</Link>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className={`p-2 rounded-lg ${isScrolled || location.pathname !== '/' || mobileMenuOpen ? 'text-slate-900' : 'text-white'}`}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-200 shadow-xl overflow-hidden animate-in slide-in-from-top-2">
            <div className="px-4 py-6 flex flex-col space-y-4">
              <Link to="/destinations" className="text-lg font-bold text-slate-800 pb-2 border-b border-slate-100">Destinations</Link>
              <Link to="/packages" className="text-lg font-bold text-slate-800 pb-2 border-b border-slate-100">Tour Packages</Link>
              <Link to="/stays" className="text-lg font-bold text-slate-800 pb-2 border-b border-slate-100">Hotels</Link>
              <Link to="/blog" className="text-lg font-bold text-slate-800 pb-2 border-b border-slate-100">Travel Journal</Link>
              
              {user ? (
                <div className="pt-4 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-lg">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500 uppercase">{user.role}</p>
                    </div>
                  </div>
                  {user.role === 'admin' && (
                    <Link to="/admin" className="block text-teal-600 font-bold">Launch Admin Panel</Link>
                  )}
                  <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="block text-slate-700 font-bold">My Account</Link>
                  <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="block w-full text-left font-bold text-red-500 pt-2">Sign out</button>
                </div>
              ) : (
                <div className="pt-4 flex flex-col space-y-3">
                  <Link to="/login" className="w-full py-3 text-center border-2 border-slate-200 rounded-xl font-bold text-slate-700">Log in</Link>
                  <Link to="/register" className="w-full py-3 text-center bg-teal-600 rounded-xl font-bold text-white shadow-md">Create Account</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main App Content Viewport */}
      <main className="flex-1 w-full">
        <Outlet />
      </main>

      {/* Dynamic Footer */}
      <footer className="bg-slate-900 text-slate-400 py-16 border-t border-slate-800">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6">
              {settings?.logo_url ? (
                <img src={settings.logo_url} alt="Brand Logo" className="h-10 w-auto object-contain rounded drop-shadow-md" />
              ) : (
                <div className="bg-teal-600 text-white p-1.5 rounded-lg shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.6L3 8l5.5 4L5 15.5 2 15l-1 1 4 4 1-1-.5-3 3.5-3.5 4 5.5h1.2l.6-1.8z"/></svg>
                </div>
              )}
              <span className="text-xl font-extrabold tracking-tight text-white">{settings?.site_name || "Aamya Holidays"}</span>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed mb-6">{settings?.footer_text || "We curate premium, life-changing travel experiences to the world's most spectacular destinations. Unleash your wanderlust."}</p>
          </div>
          <div>
            <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Explore</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/destinations" className="hover:text-teal-400 transition-colors">Locations</Link></li>
              <li><Link to="/packages" className="hover:text-teal-400 transition-colors">Tour Deals</Link></li>
              <li><Link to="/stays" className="hover:text-teal-400 transition-colors">Hotels</Link></li>
              <li><Link to="/blog" className="hover:text-teal-400 transition-colors">Travel Guides</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Company</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/p/about-us" className="hover:text-teal-400 transition-colors">About Us</Link></li>
              <li><Link to="/p/careers" className="hover:text-teal-400 transition-colors">Careers</Link></li>
              <li><a href={`mailto:${settings?.contact_email}`} className="hover:text-teal-400 transition-colors text-teal-500">{settings?.contact_email || "Email Us"}</a></li>
              {settings?.contact_phone && <li><a href={`tel:${settings.contact_phone}`} className="hover:text-teal-400 text-teal-500 transition-colors font-mono">✆ {settings.contact_phone}</a></li>}
              {settings?.whatsapp_number && <li><a href={`https://wa.me/${settings.whatsapp_number.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-green-400 text-green-500 transition-colors font-mono"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg> {settings.whatsapp_number}</a></li>}
            </ul>
          </div>
          <div>
            <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Legal</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/p/terms-of-service" className="hover:text-teal-400 transition-colors">Terms of Service</Link></li>
              <li><Link to="/p/privacy-policy" className="hover:text-teal-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/p/cookie-policy" className="hover:text-teal-400 transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-800 text-sm text-center flex flex-col md:flex-row justify-between items-center">
            <span>&copy; {new Date().getFullYear()} {settings.site_name}. All rights reserved.</span>
            <div className="flex space-x-6 mt-4 md:mt-0 font-bold transition-all">
                {settings?.social_twitter && <a href={settings.social_twitter} target="_blank" rel="noreferrer" className="hover:text-blue-400 transition-colors">Twitter</a>}
                {settings?.social_instagram && <a href={settings.social_instagram} target="_blank" rel="noreferrer" className="hover:text-pink-500 transition-colors">Instagram</a>}
                {settings?.social_facebook && <a href={settings.social_facebook} target="_blank" rel="noreferrer" className="hover:text-blue-500 transition-colors">Facebook</a>}
            </div>
        </div>
      </footer>

      {/* Floating WhatsApp Widget */}
      {settings?.whatsapp_number && (
        <a 
          href={`https://wa.me/${settings.whatsapp_number.replace(/\D/g, '')}`} 
          target="_blank" 
          rel="noreferrer"
          className="fixed bottom-6 right-6 lg:bottom-10 lg:right-10 w-14 h-14 bg-green-500 rounded-full flex items-center justify-center text-white shadow-2xl hover:bg-green-600 transition-transform hover:scale-110 z-50 animate-bounce"
          title="Chat with us on WhatsApp"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
        </a>
      )}
    </div>
  );
};

export default Layout;
