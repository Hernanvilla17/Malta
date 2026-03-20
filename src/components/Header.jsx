import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import './Header.css';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { getItemCount, toggleCart } = useCart();
  const location = useLocation();
  const itemCount = getItemCount();

  const isActive = (path) => location.pathname === path;
  const isLanding = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      className={`header ${scrolled ? 'header-scrolled' : ''} ${isLanding && !scrolled ? 'header-transparent' : ''}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="header-container">
        <Link to="/" className="logo">
          <motion.img
            src="/logo.jpg"
            alt="Malta Delivery"
            className="logo-img"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          />
        </Link>

        <button
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`hamburger ${menuOpen ? 'open' : ''}`}></span>
        </button>

        <nav className={`nav ${menuOpen ? 'nav-open' : ''}`}>
          {['/', '/menu', '/historia'].map((path, index) => {
            const labels = { '/': 'Home', '/menu': 'Menú', '/historia': 'Historia' };
            return (
              <motion.div
                key={path}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.4 }}
              >
                <Link
                  to={path}
                  className={`nav-link ${isActive(path) ? 'active' : ''}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {labels[path]}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        <motion.button
          className="cart-button"
          onClick={toggleCart}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          {itemCount > 0 && (
            <motion.span
              className="cart-count"
              initial={{ scale: 0 }}
              animate={{ scale: [1, 1.4, 1] }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              key={itemCount}
            >
              {itemCount}
            </motion.span>
          )}
        </motion.button>
      </div>
    </motion.header>
  );
}
