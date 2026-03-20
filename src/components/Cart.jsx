import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useMenuData } from '../context/MenuDataContext';
import { config } from '../data/menuData';
import './Cart.css';

// Helper: Parse business hours from config
const parseBusinessHours = () => {
  const match = config.horario.match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*-\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return { openHour: 10, closeHour: 20, workDays: [1, 2, 3, 4, 5, 6] };

  let openHour = parseInt(match[1]);
  const openPeriod = match[3].toUpperCase();
  let closeHour = parseInt(match[4]);
  const closePeriod = match[6].toUpperCase();

  if (openPeriod === 'PM' && openHour !== 12) openHour += 12;
  if (openPeriod === 'AM' && openHour === 12) openHour = 0;
  if (closePeriod === 'PM' && closeHour !== 12) closeHour += 12;
  if (closePeriod === 'AM' && closeHour === 12) closeHour = 0;

  const horarioLower = config.horario.toLowerCase();
  let workDays = [1, 2, 3, 4, 5, 6];
  if (horarioLower.includes('domingo')) workDays.push(0);

  return { openHour, closeHour, workDays };
};

const getAvailableDates = () => {
  const { workDays } = parseBusinessHours();
  const dates = [];
  const today = new Date();

  for (let i = 0; i < 30 && dates.length < 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    if (workDays.includes(date.getDay())) {
      dates.push(date);
    }
  }
  return dates;
};

const getTimeSlots = () => {
  const { openHour, closeHour } = parseBusinessHours();
  const slots = [];

  for (let hour = openHour; hour < closeHour; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    slots.push(`${hour.toString().padStart(2, '0')}:30`);
  }
  slots.push(`${closeHour.toString().padStart(2, '0')}:00`);

  return slots;
};

const formatDateDisplay = (date) => {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`;
};

const formatTimeDisplay = (time) => {
  const [hour, minute] = time.split(':').map(Number);
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
  return `${hour12}:${minute.toString().padStart(2, '0')} ${period}`;
};

export default function Cart() {
  const { cart, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, getTotal, getAhorro, clearCart, toast } = useCart();
  const { productos } = useMenuData();
  const navigate = useNavigate();
  const [customerInfo, setCustomerInfo] = useState({
    nombre: '',
    telefono: '',
    direccion: '',
    notas: ''
  });
  const [deliveryType, setDeliveryType] = useState('asap');
  const [scheduledDate, setScheduledDate] = useState(null);
  const [scheduledTime, setScheduledTime] = useState('');

  const sidebarRef = useRef(null);
  const availableDates = useMemo(() => getAvailableDates(), []);
  const timeSlots = useMemo(() => getTimeSlots(), []);

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
      // Reset scroll to top when cart opens
      requestAnimationFrame(() => {
        if (sidebarRef.current) {
          sidebarRef.current.scrollTop = 0;
        }
      });
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({ ...prev, [name]: value }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const generateWhatsAppMessage = () => {
    let message = `🛒 *Nuevo Pedido - Malta Delivery*\n\n`;
    message += `👤 ${customerInfo.nombre}\n`;
    message += `📱 ${customerInfo.telefono}\n`;
    message += `📍 ${customerInfo.direccion}\n\n`;

    if (deliveryType === 'asap') {
      message += `📅 *Entrega: Lo antes posible*\n\n`;
    } else if (scheduledDate && scheduledTime) {
      message += `📅 *Entrega programada: ${formatDateDisplay(scheduledDate)} a las ${formatTimeDisplay(scheduledTime)}*\n\n`;
    }

    message += `📋 *Pedido:*\n`;

    cart.forEach(item => {
      const precio = item.precioFinal || item.precio;
      const lineItem = `• ${item.quantity}x ${item.nombre} — ${formatCurrency(precio * item.quantity)}`;
      message += item.tienePromo ? `${lineItem} ✨\n` : `${lineItem}\n`;
    });

    const ahorro = getAhorro();
    if (ahorro > 0) {
      message += `\n🎉 *Ahorro: ${formatCurrency(ahorro)}*`;
    }

    message += `\n💰 *Total: ${formatCurrency(getTotal())}*`;

    if (customerInfo.notas) {
      message += `\n\n📝 Notas: ${customerInfo.notas}`;
    }

    return encodeURIComponent(message);
  };

  const handleSendOrder = () => {
    if (!customerInfo.nombre || !customerInfo.telefono || !customerInfo.direccion) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    if (deliveryType === 'scheduled' && (!scheduledDate || !scheduledTime)) {
      alert('Por favor selecciona fecha y hora para la entrega programada');
      return;
    }

    const message = generateWhatsAppMessage();
    const whatsappUrl = `https://wa.me/${config.whatsapp_numero}?text=${message}`;
    window.open(whatsappUrl, '_blank');
    clearCart();
    setIsCartOpen(false);
    setCustomerInfo({ nombre: '', telefono: '', direccion: '', notas: '' });
    setDeliveryType('asap');
    setScheduledDate(null);
    setScheduledTime('');
  };

  const handleGoToMenu = () => {
    setIsCartOpen(false);
    navigate('/menu');
  };

  return (
    <>
      {/* Toast notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className="cart-toast"
            key={toast.id}
            initial={{ opacity: 0, y: 40, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <img src={toast.image} alt="" className="cart-toast-img" />
            <div className="cart-toast-text">
              <span className="cart-toast-check">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </span>
              <span>{toast.name} agregado</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart sidebar */}
      {isCartOpen && (
        <>
          <div className="cart-overlay" onClick={() => setIsCartOpen(false)} />
          <div className="cart-sidebar">
            <div className="cart-header">
              <h2>Tu Pedido</h2>
              <button className="cart-close" onClick={() => setIsCartOpen(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="cart-empty">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                <p>Tu carrito está vacío</p>
                <button className="cart-empty-btn" onClick={handleGoToMenu}>
                  Ver menú
                </button>
              </div>
            ) : (
              <>
                {/* Scrollable body */}
                <div className="cart-body" ref={sidebarRef}>
                  {/* Products */}
                  <div className="cart-items">
                    {cart.map(item => {
                      const precioMostrar = item.precioFinal || item.precio;
                      const tienePromo = item.tienePromo && item.precioOriginal;
                      const originalProduct = productos.find(p => p.id === item.id);
                      const pesoPorcion = originalProduct?.peso_porcion || '';

                      return (
                        <div key={item.id} className={`cart-item ${tienePromo ? 'cart-item-promo' : ''}`}>
                          <div className="cart-item-row">
                            <h4 className="cart-item-name">{item.nombre}</h4>
                            <div className="cart-item-price-col">
                              {tienePromo && (
                                <span className="cart-item-price-old">{formatCurrency(item.precioOriginal * item.quantity)}</span>
                              )}
                              <span className="cart-item-price">{formatCurrency(precioMostrar * item.quantity)}</span>
                            </div>
                          </div>
                          <div className="cart-item-row">
                            {pesoPorcion && pesoPorcion !== '—' ? (
                              <span className="cart-item-portion">{pesoPorcion}</span>
                            ) : (
                              <span></span>
                            )}
                            <div className="cart-item-qty">
                              <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                              </button>
                              <span>{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <line x1="12" y1="5" x2="12" y2="19"></line>
                                  <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                              </button>
                            </div>
                          </div>
                          <button className="cart-item-delete" onClick={() => removeFromCart(item.id)}>
                            Eliminar
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Summary */}
                  <div className="cart-summary">
                    <div className="cart-summary-row">
                      <span>Subtotal</span>
                      <span>{formatCurrency(getAhorro() > 0 ? getTotal() + getAhorro() : getTotal())}</span>
                    </div>
                    {getAhorro() > 0 && (
                      <div className="cart-summary-row cart-summary-savings">
                        <span>Ahorro</span>
                        <span>-{formatCurrency(getAhorro())}</span>
                      </div>
                    )}
                    <div className="cart-summary-divider"></div>
                    <div className="cart-summary-row cart-summary-total">
                      <span>Total</span>
                      <span>{formatCurrency(getTotal())}</span>
                    </div>
                  </div>

                  {/* Delivery Scheduling */}
                  <div className="cart-form">
                    <div className="delivery-scheduling">
                      <h3>Programar entrega</h3>

                      <div className="delivery-toggle">
                        <button
                          className={`delivery-toggle-option ${deliveryType === 'asap' ? 'active' : ''}`}
                          onClick={() => {
                            setDeliveryType('asap');
                            setScheduledDate(null);
                            setScheduledTime('');
                          }}
                        >
                          Lo antes posible
                        </button>
                        <button
                          className={`delivery-toggle-option ${deliveryType === 'scheduled' ? 'active' : ''}`}
                          onClick={() => setDeliveryType('scheduled')}
                        >
                          Programar entrega
                        </button>
                        <motion.div
                          className="delivery-toggle-indicator"
                          layoutId="deliveryToggle"
                          animate={{ x: deliveryType === 'asap' ? 0 : '100%' }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                      </div>

                      <AnimatePresence>
                        {deliveryType === 'scheduled' && (
                          <motion.div
                            className="scheduled-selectors"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                          >
                            <div className="selector-group">
                              <label>Fecha de entrega</label>
                              <div className="date-selector">
                                {availableDates.map((date, index) => {
                                  const isSelected = scheduledDate &&
                                    date.toDateString() === scheduledDate.toDateString();
                                  const isToday = date.toDateString() === new Date().toDateString();
                                  return (
                                    <button
                                      key={index}
                                      className={`date-option ${isSelected ? 'selected' : ''}`}
                                      onClick={() => setScheduledDate(date)}
                                    >
                                      <span className="date-day">
                                        {isToday ? 'Hoy' : ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][date.getDay()]}
                                      </span>
                                      <span className="date-number">{date.getDate()}</span>
                                      <span className="date-month">
                                        {['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][date.getMonth()]}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            <div className="selector-group">
                              <label>Hora de entrega</label>
                              <div className="time-selector">
                                {timeSlots.map((time, index) => (
                                  <button
                                    key={index}
                                    className={`time-option ${scheduledTime === time ? 'selected' : ''}`}
                                    onClick={() => setScheduledTime(time)}
                                  >
                                    {formatTimeDisplay(time)}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {scheduledDate && scheduledTime && (
                              <motion.div
                                className="scheduled-summary"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                  <line x1="16" y1="2" x2="16" y2="6"></line>
                                  <line x1="8" y1="2" x2="8" y2="6"></line>
                                  <line x1="3" y1="10" x2="21" y2="10"></line>
                                </svg>
                                <span>{formatDateDisplay(scheduledDate)} a las {formatTimeDisplay(scheduledTime)}</span>
                              </motion.div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Customer info */}
                    <h3>Datos de entrega</h3>

                    <div className="cart-input-group">
                      <div className="cart-input-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                      </div>
                      <input
                        type="text"
                        name="nombre"
                        placeholder="Nombre completo *"
                        value={customerInfo.nombre}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="cart-input-group">
                      <div className="cart-input-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                        </svg>
                      </div>
                      <input
                        type="tel"
                        name="telefono"
                        placeholder="Teléfono *"
                        value={customerInfo.telefono}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="cart-input-group">
                      <div className="cart-input-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                      </div>
                      <input
                        type="text"
                        name="direccion"
                        placeholder="Dirección de entrega *"
                        value={customerInfo.direccion}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="cart-input-group cart-input-textarea">
                      <div className="cart-input-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                          <line x1="16" y1="13" x2="8" y2="13"></line>
                          <line x1="16" y1="17" x2="8" y2="17"></line>
                        </svg>
                      </div>
                      <textarea
                        name="notas"
                        placeholder="Notas adicionales (opcional)"
                        value={customerInfo.notas}
                        onChange={handleInputChange}
                        rows="2"
                      />
                    </div>
                  </div>
                </div>

                {/* Sticky footer */}
                <div className="cart-footer">
                  <button
                    className="cart-whatsapp-btn"
                    onClick={handleSendOrder}
                    disabled={!customerInfo.nombre || !customerInfo.telefono || !customerInfo.direccion || (deliveryType === 'scheduled' && (!scheduledDate || !scheduledTime))}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    <span>Enviar pedido por WhatsApp</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
}
