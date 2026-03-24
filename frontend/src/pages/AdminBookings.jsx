import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';

const AdminBookings = () => {
  const { user, logout } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetch(((window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')) ? 'http://localhost/aamya_holiday/backend/public/api/admin/bookings' : '/backend/public/api/admin/bookings'))
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                setBookings(data.data);
            }
        })
        .finally(() => setLoading(false));
    }
  }, [user]);

  // Protect route
  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="w-full bg-slate-50">
      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-auto h-screen">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Booking Management</h1>
            <p className="text-slate-500">View and manage all customer reservations.</p>
          </div>
        </header>

        {/* Bookings Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800">All E-commerce Transactions</h2>
          </div>
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Ref ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Itinerary / Package</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Check-in</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {loading ? (
                <tr><td colSpan="6" className="text-center py-8 text-gray-500">Loading bookings...</td></tr>
              ) : bookings.length > 0 ? (
                bookings.map(row => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-teal-600 font-bold">{row.booking_ref}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-bold">
                        {row.primary_guest_name}
                        <span className="block text-xs font-normal text-slate-500">{row.user_email}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-medium">
                      {row.package_name}
                      <span className="block text-xs text-slate-500">{row.guests} Guests</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-bold">
                        ₹{Number(row.total_amount).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-bold rounded-lg bg-teal-100 text-teal-700 uppercase tracking-wide">
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-600">
                      {row.check_in_date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <a 
                            href={`${(window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')) ? 'http://localhost/aamya_holiday/backend/public/api' : '/backend/public/api'}/pdf/booking/${row.booking_ref}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-teal-600 hover:text-teal-900 font-bold bg-teal-50 px-3 py-1.5 rounded-lg transition"
                        >
                            Invoice PDF
                        </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="7" className="text-center py-8 text-gray-500 font-medium">No confirmed bookings found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

      </main>
    </div>
  );
};

export default AdminBookings;
