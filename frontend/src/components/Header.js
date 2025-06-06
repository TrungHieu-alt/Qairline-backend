import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function Header({ isAdmin = false }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [language, setLanguage] = useState('EN');
  const [currency, setCurrency] = useState('VND');
  const [scrollY, setScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const showHeader = !isMobile && scrollY < 100;
  const showHamburger = isMobile || scrollY >= 100;

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navItemVariants = {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0 },
    hover: { scale: 1.05, color: '#fcd34d' }
  };

  return (
    <>
      <AnimatePresence>
        {showHeader && (
          <motion.header
            key="header"
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className="fixed top-0 left-0 w-full z-50"
          >
            <div className="relative h-24">
              <div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(to right, rgba(63, 194, 234, 0.9), rgba(132, 255, 198, 0.9), rgba(37, 224, 230, 0.9))',
                }}
              />
              <div className="relative flex justify-between items-center h-full px-4">
                <Link to={isAdmin ? '/admin' : '/'} className="flex items-center space-x-3">
                  <img
                    src="https://th.bing.com/th/id/R.ba7ed8706ef73b284772b3f07a479f0c?rik=%2fXA%2bwffDaP0jJQ&pid=ImgRaw&r=0"
                    alt="QAirline Logo"
                    className="w-12 h-12 rounded-full border-2 border-amber-300 shadow-lg"
                  />
                  <span className="font-extrabold text-gray-800 text-4xl drop-shadow-xl">
                    {isAdmin ? 'QAirline Admin' : 'QAirline'}
                  </span>
                </Link>

                <nav className="hidden md:flex space-x-6">
                  {isAdmin ? (
                    <>
                      {['announcements', 'aircrafts', 'flights', 'tickets'].map((item) => (
                        <motion.div key={item} variants={navItemVariants} initial="initial" animate="animate" whileHover="hover">
                          <Link to={`/admin/${item}`} className="text-gray-800 font-semibold text-base">
                            {item.charAt(0).toUpperCase() + item.slice(1)}
                          </Link>
                        </motion.div>
                      ))}
                    </>
                  ) : (
                    <>
                      {['flights', 'tickets', 'promotions'].map((item) => (
                        <motion.div key={item} variants={navItemVariants} initial="initial" animate="animate" whileHover="hover">
                          <Link to={`/${item}`} className="text-gray-800 font-semibold text-base">
                            {item === 'tickets' ? 'Vé của tôi' : item.charAt(0).toUpperCase() + item.slice(1)}
                          </Link>
                        </motion.div>
                      ))}
                    </>
                  )}
                </nav>

                <div className="flex items-center space-x-3">
                  <select value={language} onChange={(e) => setLanguage(e.target.value)} className="bg-transparent border border-gray-800 rounded px-2 py-1 text-gray-800 text-sm">
                    <option value="EN" className="text-black">EN</option>
                    <option value="VN" className="text-black">VN</option>
                  </select>
                  <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="bg-transparent border border-gray-800 rounded px-2 py-1 text-gray-800 text-sm">
                    <option value="VND" className="text-black">VND</option>
                    <option value="USD" className="text-black">USD</option>
                  </select>
                  <button className="text-gray-800">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                  {user ? (
                    <button onClick={handleLogout} className="text-gray-800 font-semibold text-base">
                      Đăng xuất
                    </button>
                  ) : (
                    <>
                      <Link to="/login" className="text-gray-800 font-semibold text-base">
                        Đăng nhập
                      </Link>
                      <Link to="/register" className="text-gray-800 font-semibold text-base">
                        Đăng ký
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      <motion.button
        animate={{ opacity: showHamburger ? 1 : 0 }}
        style={{ pointerEvents: showHamburger ? 'auto' : 'none' }}
        className="fixed top-4 right-4 z-60 p-3 rounded-full shadow-lg"
        onClick={toggleMenu}
        style={{ backgroundColor: 'rgba(7, 150, 81, 0.95)' }}
      >
        <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </motion.button>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black bg-opacity-50"
            onClick={() => setIsMenuOpen(false)}
          >
            <motion.div
              initial={{ y: -100 }}
              animate={{ y: 0 }}
              exit={{ y: -100 }}
              className="bg-gray-50 p-6 shadow-2xl rounded-b-2xl max-w-md w-full mx-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <nav className="flex flex-col space-y-4">
                {isAdmin ? (
                  <>
                    {['announcements', 'aircrafts', 'flights', 'tickets'].map((item) => (
                      <Link key={item} to={`/admin/${item}`} className="text-gray-900 font-semibold text-base" onClick={toggleMenu}>
                        {item.charAt(0).toUpperCase() + item.slice(1)}
                      </Link>
                    ))}
                  </>
                ) : (
                  <>
                    {['flights', 'tickets', 'promotions'].map((item) => (
                      <Link key={item} to={`/${item}`} className="text-gray-900 font-semibold text-base" onClick={toggleMenu}>
                        {item === 'tickets' ? 'Vé của tôi' : item.charAt(0).toUpperCase() + item.slice(1)}
                      </Link>
                    ))}
                  </>
                )}
                <div className="flex space-x-4">
                  <select value={language} onChange={(e) => setLanguage(e.target.value)} className="bg-gray-100 border border-green-300 text-gray-900 rounded-lg px-3 py-1.5">
                    <option value="EN">EN</option>
                    <option value="VN">VN</option>
                  </select>
                  <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="bg-gray-100 border border-green-300 text-gray-900 rounded-lg px-3 py-1.5">
                    <option value="VND">VND</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
                {user ? (
                  <button onClick={handleLogout} className="text-gray-900 font-semibold text-base">
                    Đăng xuất
                  </button>
                ) : (
                  <div className="flex flex-col space-y-2">
                    <Link to="/login" className="text-gray-900 font-semibold text-base" onClick={toggleMenu}>
                      Đăng nhập
                    </Link>
                    <Link to="/register" className="text-gray-900 font-semibold text-base" onClick={toggleMenu}>
                      Đăng ký
                    </Link>
                  </div>
                )}
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Header;