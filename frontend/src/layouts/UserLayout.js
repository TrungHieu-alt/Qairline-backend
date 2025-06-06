import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';

function UserLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    if (user && user.role === 'admin') {
      navigate('/admin');
    }
    // Không còn kiểm tra /tickets và /booking
    const protectedRoutes = []; // Các route cần bảo vệ (nếu có, thêm vào đây)
    const currentPath = window.location.pathname;
    if (!user && protectedRoutes.some((route) => currentPath.startsWith(route))) {
      navigate('/login');
    }
    setIsLoading(false);
  }, [user, navigate]);

  // Animation variants cho nội dung chính
  const mainVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">
      <Header isAdmin={false} />
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            className="w-12 h-12 border-4 border-t-emerald-600 border-gray-200 rounded-full"
          />
        </div>
      ) : (
        <motion.main
          variants={mainVariants}
          initial="initial"
          animate="animate"
          className="container mx-auto px-4 sm:px-6 pt-32 pb-16 flex-grow"
          role="main"
          aria-label="Main content"
        >
          <Outlet />
        </motion.main>
      )}
      <Footer />
    </div>
  );
}

export default UserLayout;