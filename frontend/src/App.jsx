import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import AdminPackages from './pages/AdminPackages';
import AdminVendors from './pages/AdminVendors';
import AdminLeads from './pages/AdminLeads';
import AdminDestinations from './pages/AdminDestinations';
import AdminBookings from './pages/AdminBookings';
import AdminStays from './pages/AdminStays';
import AdminSettings from './pages/AdminSettings';
import Packages from './pages/Packages';
import PackageDetails from './pages/PackageDetails';
import Destinations from './pages/Destinations';
import DestinationDetails from './pages/DestinationDetails';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import UserProfile from './pages/UserProfile';
import Checkout from './pages/Checkout';
import Stays from './pages/Stays';
import StayDetails from './pages/StayDetails';
import Page from './pages/Page';
import AdminPages from './pages/AdminPages';
import AdminBlog from './pages/AdminBlog';
function App() {
  return (
    <HelmetProvider>
      <SettingsProvider>
      <AuthProvider>
        <Router>
          <Routes>
          {/* Public Website Routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="packages" element={<Packages />} />
            <Route path="packages/:slug" element={<PackageDetails />} />
            <Route path="destinations" element={<Destinations />} />
            <Route path="destinations/:slug" element={<DestinationDetails />} />
            <Route path="stays" element={<Stays />} />
            <Route path="stays/:slug" element={<StayDetails />} />
            <Route path="blog" element={<Blog />} />
            <Route path="blog/:slug" element={<BlogPost />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="checkout/:slug" element={<Checkout />} />
            <Route path="p/:slug" element={<Page />} />
            <Route path="*" element={<div className="text-center py-20 font-bold text-red-500 text-2xl">404 - Fasten your seatbelts, this page is missing.</div>} />
          </Route>
          
          {/* Admin Dashboard Routes - Correct Nested Router Architecture */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="leads" element={<AdminLeads />} />
            <Route path="packages" element={<AdminPackages />} />
            <Route path="stays" element={<AdminStays />} />
            <Route path="vendors" element={<AdminVendors />} />
            <Route path="destinations" element={<AdminDestinations />} />
            <Route path="blog" element={<AdminBlog />} />
            <Route path="pages" element={<AdminPages />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
          </Routes>
        </Router>
      </AuthProvider>
      </SettingsProvider>
    </HelmetProvider>
  );
}

export default App;
