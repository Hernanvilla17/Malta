import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPromocionProducto, calcularPrecioPromo } from '../data/menuData';
import { useCart } from '../context/CartContext';
import { useMenuData } from '../context/MenuDataContext';
import './Menu.css';

export default function Menu() {
  const [categoriaActiva, setCategoriaActiva] = useState('todas');
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [cantidadSeleccionada, setCantidadSeleccionada] = useState(1);
  const [imagenActiva, setImagenActiva] = useState(0);
  const { addToCart } = useCart();
  const { productos, categorias } = useMenuData();

  const abrirDetalle = (producto) => {
    setProductoSeleccionado(producto);
    setCantidadSeleccionada(1);
    setImagenActiva(0);
  };

  const cerrarDetalle = () => {
    setProductoSeleccionado(null);
  };

  const agregarAlPedido = () => {
    const promocion = getPromocionProducto(productoSeleccionado.id);
    const tienePromo = productoSeleccionado.en_promocion || promocion;
    const precioFinal = tienePromo
      ? (productoSeleccionado.precio_promocion || calcularPrecioPromo(productoSeleccionado.precio, promocion))
      : productoSeleccionado.precio;

    for (let i = 0; i < cantidadSeleccionada; i++) {
      addToCart({
        ...productoSeleccionado,
        precioFinal: precioFinal,
        precioOriginal: productoSeleccionado.precio,
        tienePromo: tienePromo
      });
    }
    cerrarDetalle();
  };

  const getImagenesProducto = (producto) => {
    return [producto.imagen_1, producto.imagen_2, producto.imagen_3].filter(Boolean);
  };

  const categoriasActivas = categorias.filter(c => c.activo).sort((a, b) => a.orden - b.orden);

  const productosFiltrados = productos
    .filter(p => p.activo)
    .filter(p => categoriaActiva === 'todas' || p.categoria_id === categoriaActiva)
    .sort((a, b) => a.orden - b.orden);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getNombreCategoria = (categoriaId) => {
    const categoria = categorias.find(c => c.id === categoriaId);
    return categoria ? categoria.nombre : '';
  };

  return (
    <main className="menu-page">
      {/* Hero */}
      <section className="menu-hero">
        <div className="menu-hero-overlay"></div>
        <div className="menu-hero-content">
          <span className="menu-hero-label">Malta Delivery</span>
          <h1>Nuestro Menú</h1>
          <div className="menu-hero-divider"></div>
          <p>Porciones para 6-8 personas · Entrega a domicilio</p>
        </div>
      </section>

      {/* Filtros sticky */}
      <div className="menu-filters-bar">
        <div className="menu-filters">
          <button
            className={`filter-btn ${categoriaActiva === 'todas' ? 'active' : ''}`}
            onClick={() => setCategoriaActiva('todas')}
          >
            Todos
          </button>
          {categoriasActivas.map(categoria => (
            <button
              key={categoria.id}
              className={`filter-btn ${categoriaActiva === categoria.id ? 'active' : ''}`}
              onClick={() => setCategoriaActiva(categoria.id)}
            >
              {categoria.nombre}
            </button>
          ))}
        </div>
      </div>

      {/* Productos */}
      <section className="menu-section">
        <div className="menu-container">

          {/* Grid de productos */}
          <div className="productos-grid">
            {productosFiltrados.map(producto => {
              const promocion = getPromocionProducto(producto.id);
              const tienePromo = producto.en_promocion || promocion;
              const precioFinal = tienePromo
                ? (producto.precio_promocion || calcularPrecioPromo(producto.precio, promocion))
                : producto.precio;
              const porcentajeDescuento = tienePromo
                ? Math.round((1 - precioFinal / producto.precio) * 100)
                : 0;

              return (
                <div
                  key={producto.id}
                  className={`producto-card ${tienePromo ? 'producto-card-promo' : ''}`}
                  onClick={() => abrirDetalle(producto)}
                >
                  <div className="producto-image-wrapper">
                    {producto.imagen_1 ? (
                      <img
                        src={producto.imagen_1}
                        alt={producto.nombre}
                        className="producto-image"
                      />
                    ) : (
                      <div className="producto-image producto-image-placeholder" />
                    )}
                    <span className="producto-categoria">
                      {getNombreCategoria(producto.categoria_id)}
                    </span>
                    {tienePromo && (
                      <span className="producto-promo-badge">
                        {porcentajeDescuento}% OFF
                      </span>
                    )}
                    <div className="producto-ver-detalle">
                      <span>Ver detalle</span>
                    </div>
                  </div>
                  <div className="producto-content">
                    <h3 className="producto-nombre">{producto.nombre}</h3>
                    <p className="producto-descripcion">{producto.descripcion}</p>
                    <div className="producto-footer">
                      <div className="producto-info">
                        {tienePromo ? (
                          <div className="producto-precios-promo">
                            <span className="producto-precio-original">{formatCurrency(producto.precio)}</span>
                            <span className="producto-precio-promo">{formatCurrency(precioFinal)}</span>
                          </div>
                        ) : (
                          <span className="producto-precio">{formatCurrency(producto.precio)}</span>
                        )}
                        <span className="producto-porcion">{producto.peso_porcion}</span>
                      </div>
                      <button
                        className="producto-add-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart({
                            ...producto,
                            precioFinal: precioFinal,
                            precioOriginal: producto.precio,
                            tienePromo: tienePromo
                          });
                        }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="12" y1="5" x2="12" y2="19"></line>
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Agregar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {productosFiltrados.length === 0 && (
            <div className="no-productos">
              <p>No hay productos disponibles en esta categoría.</p>
            </div>
          )}
        </div>
      </section>

      {/* Info adicional */}
      <section className="menu-info">
        <div className="info-container">
          <div className="info-item">
            <div className="info-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <div>
              <h4>Tiempo de preparación</h4>
              <p>Los pedidos se preparan el mismo día</p>
            </div>
          </div>
          <div className="info-item">
            <div className="info-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div>
              <h4>Porciones familiares</h4>
              <p>Ideales para 6-8 personas</p>
            </div>
          </div>
          <div className="info-item">
            <div className="info-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </div>
            <div>
              <h4>Entrega a domicilio</h4>
              <p>En toda la zona metropolitana</p>
            </div>
          </div>
        </div>
      </section>

      {/* Modal de detalle de producto */}
      <AnimatePresence>
        {productoSeleccionado && (
          <motion.div
            className="producto-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={cerrarDetalle}
          >
            <motion.div
              className="producto-modal"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="modal-close" onClick={cerrarDetalle}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>

              {(() => {
                const imagenes = getImagenesProducto(productoSeleccionado);
                const promocion = getPromocionProducto(productoSeleccionado.id);
                const tienePromo = productoSeleccionado.en_promocion || promocion;
                const precioFinal = tienePromo
                  ? (productoSeleccionado.precio_promocion || calcularPrecioPromo(productoSeleccionado.precio, promocion))
                  : productoSeleccionado.precio;
                const porcentajeDescuento = tienePromo
                  ? Math.round((1 - precioFinal / productoSeleccionado.precio) * 100)
                  : 0;

                return (
                  <>
                    {/* Galería de imágenes */}
                    {imagenes.length > 0 && (
                    <div className="modal-galeria">
                      <div className="modal-imagen-principal">
                        <img src={imagenes[imagenActiva]} alt={productoSeleccionado.nombre} />
                        {tienePromo && (
                          <span className="modal-promo-badge">{porcentajeDescuento}% OFF</span>
                        )}
                      </div>
                      {imagenes.length > 1 && (
                        <div className="modal-miniaturas">
                          {imagenes.map((img, index) => (
                            <button
                              key={index}
                              className={`modal-miniatura ${imagenActiva === index ? 'active' : ''}`}
                              onClick={() => setImagenActiva(index)}
                            >
                              <img src={img} alt={`${productoSeleccionado.nombre} ${index + 1}`} />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    )}

                    {/* Información del producto */}
                    <div className="modal-info">
                      <span className="modal-categoria">
                        {getNombreCategoria(productoSeleccionado.categoria_id)}
                      </span>
                      <h2 className="modal-nombre">{productoSeleccionado.nombre}</h2>
                      <p className="modal-descripcion">{productoSeleccionado.descripcion}</p>

                      <div className="modal-detalles">
                        <div className="modal-detalle">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                            <line x1="7" y1="7" x2="7.01" y2="7"></line>
                          </svg>
                          <span>Peso/Porción: {productoSeleccionado.peso_porcion}</span>
                        </div>
                      </div>

                      {/* Precio */}
                      <div className="modal-precio-section">
                        {tienePromo ? (
                          <div className="modal-precios">
                            <span className="modal-precio-original">{formatCurrency(productoSeleccionado.precio)}</span>
                            <span className="modal-precio-final">{formatCurrency(precioFinal)}</span>
                          </div>
                        ) : (
                          <span className="modal-precio-final">{formatCurrency(productoSeleccionado.precio)}</span>
                        )}
                      </div>

                      {/* Selector de cantidad */}
                      <div className="modal-cantidad">
                        <span className="modal-cantidad-label">Cantidad:</span>
                        <div className="modal-cantidad-controls">
                          <button
                            className="cantidad-btn"
                            onClick={() => setCantidadSeleccionada(Math.max(1, cantidadSeleccionada - 1))}
                            disabled={cantidadSeleccionada <= 1}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                          </button>
                          <span className="cantidad-valor">{cantidadSeleccionada}</span>
                          <button
                            className="cantidad-btn"
                            onClick={() => setCantidadSeleccionada(cantidadSeleccionada + 1)}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="12" y1="5" x2="12" y2="19"></line>
                              <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Botón agregar */}
                      <button className="modal-agregar-btn" onClick={agregarAlPedido}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="9" cy="21" r="1"></circle>
                          <circle cx="20" cy="21" r="1"></circle>
                          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                        </svg>
                        Agregar al pedido ({formatCurrency(precioFinal * cantidadSeleccionada)})
                      </button>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
