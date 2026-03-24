import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';

const AdminLayout = () => {
  const { user } = useContext(AuthContext);

  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Permanent Unified Sidebar */}
      <AdminSidebar />
      
      {/* Route Content Area */}
      <div className="flex-1 overflow-auto h-screen">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
