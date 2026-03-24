import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';

const AdminSidebar = () => {
  const { logout } = useContext(AuthContext);
  const location = useLocation();

  const navLinks = [
    { path: '/admin', label: 'Dashboard Overview' },
    { path: '/admin/leads', label: 'CRM / Leads' },
    { path: '/admin/bookings', label: 'Manage Bookings' },
    { path: '/admin/packages', label: 'Manage Packages' },
    { path: '/admin/stays', label: 'Manage Stays' },
    { path: '/admin/destinations', label: 'Manage Destinations' },
    { path: '/admin/vendors', label: 'Vendor Database' },
    { path: '/admin/blog', label: 'Manage Blog' },
    { path: '/admin/pages', label: 'Manage Pages (CMS)' },
    { path: '/admin/settings', label: 'Site Settings' },
  ];

  return (
    <aside className="w-64 bg-slate-800 text-white flex-shrink-0 relative h-screen">
      <div className="p-6 border-b border-slate-700">
        <Link to="/" className="text-xl font-bold hover:text-teal-400 transition">✈️ Aamya Admin</Link>
      </div>
      <nav className="p-4 space-y-2">
        {navLinks.map((link) => {
          // Check if active (exact match for /admin, or starts with for others)
          const isActive = link.path === '/admin' 
              ? location.pathname === '/admin' 
              : location.pathname.startsWith(link.path);

          return (
            <Link 
              key={link.path}
              to={link.path} 
              className={`block px-4 py-2 rounded font-medium transition ${isActive ? 'bg-teal-600 text-white shadow-md' : 'hover:bg-slate-700 text-slate-300'}`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="absolute bottom-0 w-full p-4 border-t border-slate-700">
        <button onClick={logout} className="w-full text-left px-4 py-2 hover:bg-slate-700 hover:text-red-400 rounded transition flex items-center gap-2 font-medium">
          Logout
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
