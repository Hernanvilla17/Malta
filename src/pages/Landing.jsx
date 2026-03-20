import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useState } from 'react';
import { config, getPromocionBanner, formatearFechaPromo, getPromocionProducto, calcularPrecioPromo } from '../data/menuData';
import { useCart } from '../context/CartContext';
import { useMenuData } from '../context/MenuDataContext';
import './Landing.css';

export default function Landing() {
  const { addToCart } = useCart();
  const { productos } = useMenuData();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const destacados = productos.filter(p => p.destacado && p.activo).slice(0, 3);
  const heroRef = useRef(null);
  const promocionActiva = getPromocionBanner();

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      // TODO: Conectar a Google Sheets como lead capture
      console.log('Email capturado:', email);
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 3000);
      setEmail('');
    }
  };

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <main className="landing">
      {/* Hero Section with Parallax */}
      <section className="hero" ref={heroRef}>
        <motion.div
          className="hero-bg"
          style={{ y: heroY }}
        />
        <div className="hero-overlay"></div>
        <motion.div
          className="hero-content"
          style={{ opacity: heroOpacity }}
        >
          <motion.img
            src="/logo.jpg"
            alt="Malta Delivery"
            className="hero-logo-img"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.p
            className="hero-tagline"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {config.tagline}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link to="/menu" className="hero-cta">
              <span>Ver Menú</span>
              <div className="cta-glow"></div>
            </Link>
          </motion.div>

          <motion.div
            className="scroll-indicator"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <div className="scroll-mouse">
              <div className="scroll-wheel"></div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Promo Banner - Compacto tipo alert */}
      {promocionActiva && (
        <motion.section
          className="promo-alert"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="promo-alert-container">
            <div className="promo-alert-image">
              <img src={promocionActiva.imagen_url} alt={promocionActiva.titulo} />
              <span className="promo-alert-badge">
                {promocionActiva.tipo_descuento === 'porcentaje'
                  ? `${promocionActiva.valor_descuento}%`
                  : `$${promocionActiva.valor_descuento}`} OFF
              </span>
            </div>
            <div className="promo-alert-content">
              <span className="promo-alert-title">{promocionActiva.titulo}</span>
              <span className="promo-alert-desc">{promocionActiva.descripcion}</span>
              <span className="promo-alert-dates">
                {formatearFechaPromo(promocionActiva.fecha_inicio)} - {formatearFechaPromo(promocionActiva.fecha_fin)}
              </span>
            </div>
            <Link to="/menu" className="promo-alert-btn">
              Ver promo
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </Link>
          </div>
        </motion.section>
      )}

      {/* Benefits Banner - Compact horizontal strip */}
      <motion.section
        className="benefits-banner"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="benefits-strip">
          <div className="benefit-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <span>Hecho en casa</span>
          </div>
          <div className="benefit-divider"></div>
          <div className="benefit-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <span>{config.porciones_texto}</span>
          </div>
          <div className="benefit-divider"></div>
          <div className="benefit-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="3" width="15" height="13"></rect>
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
              <circle cx="5.5" cy="18.5" r="2.5"></circle>
              <circle cx="18.5" cy="18.5" r="2.5"></circle>
            </svg>
            <span>Entrega a domicilio</span>
          </div>
        </div>
      </motion.section>

      {/* Featured Dishes - Editorial Layout */}
      <section className="featured-section">
        <motion.div
          className="featured-grid"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Main featured dish - large card */}
          {destacados[0] && (
            <FeaturedCard
              producto={destacados[0]}
              formatCurrency={formatCurrency}
              addToCart={addToCart}
              isMain={true}
            />
          )}

          {/* Secondary dishes - stacked */}
          <div className="featured-stack">
            {destacados.slice(1, 3).map((producto) => (
              <FeaturedCard
                key={producto.id}
                producto={producto}
                formatCurrency={formatCurrency}
                addToCart={addToCart}
                isMain={false}
              />
            ))}
          </div>
        </motion.div>

      </section>

      {/* Historia Banner - Split Layout */}
      <section className="historia-banner">
        <motion.div
          className="historia-banner-left"
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="historia-banner-title">
            Conoce nuestra<br />
            <span className="historia-title-accent">historia</span>
          </h2>
          <p className="historia-banner-subtitle">Descubre la pasión detrás de cada platillo</p>
          <Link to="/historia" className="historia-banner-btn">
            <span>Descubrir más</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </Link>
        </motion.div>

        <motion.div
          className="historia-banner-right"
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="historia-collage">
            {[productos[0], productos[1], productos[4], productos[2]]
              .filter(p => p?.imagen_1)
              .slice(0, 4)
              .map((p, i) => (
                <motion.div
                  key={p.id}
                  className={`collage-img collage-img-${i + 1}`}
                  whileHover={{ scale: 1.05, zIndex: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  <img src={p.imagen_1} alt={p.nombre} />
                </motion.div>
              ))}
          </div>
        </motion.div>
      </section>

      {/* Newsletter Section - Dark Premium */}
      <section className="newsletter-section">
        <div className="newsletter-pattern"></div>
        <motion.div
          className="newsletter-content"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Animated Icon */}
          <motion.div
            className="newsletter-icon"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0"></path>
            </svg>
          </motion.div>

          <h2 className="newsletter-title">¿Quieres promos exclusivas?</h2>
          <p className="newsletter-subtitle">Déjanos tu email y te avisamos de cada oferta</p>

          <form className="newsletter-form" onSubmit={handleSubscribe}>
            <div className="newsletter-input-wrapper">
              <input
                type="email"
                placeholder="tucorreo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="newsletter-input"
              />
              <button type="submit" className={`newsletter-btn ${subscribed ? 'subscribed' : ''}`}>
                {subscribed ? (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>Listo</span>
                  </>
                ) : (
                  <span>Suscribirme</span>
                )}
              </button>
            </div>
          </form>

          <p className="newsletter-disclaimer">Sin spam, solo promos</p>
        </motion.div>
      </section>
    </main>
  );
}

function FeaturedCard({ producto, formatCurrency, addToCart, isMain }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const promocion = getPromocionProducto(producto.id);
  const tienePromo = producto.en_promocion || promocion;
  const precioFinal = tienePromo
    ? (producto.precio_promocion || calcularPrecioPromo(producto.precio, promocion))
    : producto.precio;
  const porcentajeDescuento = tienePromo
    ? Math.round((1 - precioFinal / producto.precio) * 100)
    : 0;

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);
    addToCart({
      ...producto,
      precioFinal: precioFinal,
      precioOriginal: producto.precio,
      tienePromo: tienePromo
    });
    setTimeout(() => setIsAdding(false), 800);
  };

  return (
    <motion.div
      className={`featured-card ${isMain ? 'featured-main' : 'featured-secondary'} ${tienePromo ? 'featured-card-promo' : ''}`}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Link to="/menu" className="featured-card-link">
        <div className="featured-image-container">
          {producto.imagen_1 ? (
            <motion.img
              src={producto.imagen_1}
              alt={producto.nombre}
              className="featured-image"
              animate={{ scale: isHovered ? 1.08 : 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            />
          ) : (
            <div className="featured-image featured-image-placeholder" />
          )}
          <div className="featured-overlay" />

          {/* Promo badge */}
          {tienePromo && (
            <div className="featured-promo-badge">
              {porcentajeDescuento}% OFF
            </div>
          )}

          {/* Content overlay */}
          <div className="featured-content">
            <div className="featured-info">
              <h3 className="featured-name">{producto.nombre}</h3>
              {tienePromo ? (
                <div className="featured-prices">
                  <span className="featured-price-original">{formatCurrency(producto.precio)}</span>
                  <span className="featured-price">{formatCurrency(precioFinal)}</span>
                </div>
              ) : (
                <span className="featured-price">{formatCurrency(producto.precio)}</span>
              )}
            </div>

            <motion.button
              className={`featured-add-btn ${isAdding ? 'adding' : ''}`}
              onClick={handleAdd}
              initial={{ opacity: 0, y: 10 }}
              animate={{
                opacity: isHovered ? 1 : 0,
                y: isHovered ? 0 : 10
              }}
              transition={{ duration: 0.25 }}
            >
              {isAdding ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              )}
            </motion.button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
