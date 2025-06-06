import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

function AdminLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div>
      <Header isAdmin={true} />
      <main className="container mx-auto px-2 sm:px-4 pt-28">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default AdminLayout;