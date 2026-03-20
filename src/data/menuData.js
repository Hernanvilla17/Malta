// Datos de prueba del menú - eventualmente se conectarán a Google Sheets

// Promociones activas (conectará con hoja "promociones" de Google Sheets)
export const promociones = [
  {
    id: 'PROMO-001',
    titulo: 'Especial de Temporada',
    descripcion: 'Disfruta un 20% de descuento en toda nuestra lasagna',
    tipo_descuento: 'porcentaje', // 'porcentaje' o 'monto_fijo'
    valor_descuento: 20,
    producto_id: 'PROD-001', // null si aplica_a es 'todo'
    aplica_a: 'producto', // 'todo' o 'producto'
    fecha_inicio: '2026-01-01',
    fecha_fin: '2026-03-15',
    imagen_url: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=1200',
    activo: true
  },
  {
    id: 'PROMO-002',
    titulo: 'Martes de Pasta',
    descripcion: '15% de descuento en pastas los martes',
    tipo_descuento: 'porcentaje',
    valor_descuento: 15,
    producto_id: 'PROD-002',
    aplica_a: 'producto',
    fecha_inicio: '2026-02-01',
    fecha_fin: '2026-02-28',
    imagen_url: 'https://images.unsplash.com/photo-1622973536968-3ead9e780960?w=1200',
    activo: true
  }
];

// Helper: Obtener promociones activas (entre fecha_inicio y fecha_fin con activo=true)
export const getPromocionesActivas = () => {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  return promociones.filter(promo => {
    if (!promo.activo) return false;
    const inicio = new Date(promo.fecha_inicio);
    const fin = new Date(promo.fecha_fin);
    fin.setHours(23, 59, 59, 999);
    return hoy >= inicio && hoy <= fin;
  });
};

// Helper: Obtener la promoción principal para el banner (la primera activa)
export const getPromocionBanner = () => {
  const activas = getPromocionesActivas();
  return activas.length > 0 ? activas[0] : null;
};

// Helper: Verificar si un producto tiene promoción activa
export const getPromocionProducto = (productoId) => {
  const activas = getPromocionesActivas();
  return activas.find(promo =>
    promo.aplica_a === 'todo' || promo.producto_id === productoId
  );
};

// Helper: Calcular precio con descuento
export const calcularPrecioPromo = (precioOriginal, promocion) => {
  if (!promocion) return precioOriginal;

  if (promocion.tipo_descuento === 'porcentaje') {
    return Math.round(precioOriginal * (1 - promocion.valor_descuento / 100));
  } else {
    return Math.max(0, precioOriginal - promocion.valor_descuento);
  }
};

// Helper: Formatear fecha para mostrar
export const formatearFechaPromo = (fechaStr) => {
  const fecha = new Date(fechaStr);
  return fecha.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short'
  });
};

export const categorias = [
  { id: 'CAT-01', nombre: 'Comida Completa', orden: 1, activo: true },
  { id: 'CAT-02', nombre: 'Cremas y Caldos', orden: 2, activo: true }
];

export const productos = [
  {
    id: 'PROD-001',
    categoria_id: 'CAT-01',
    nombre: 'Lasagna (carne, requesón)',
    descripcion: 'Deliciosa lasagna casera con carne molida y requesón, gratinada al horno',
    peso_porcion: '1.5 kg',
    precio: 550,
    precio_promocion: 440,
    en_promocion: true,
    imagen_1: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=800',
    activo: true,
    destacado: true,
    orden: 1
  },
  {
    id: 'PROD-002',
    categoria_id: 'CAT-01',
    nombre: 'Spaghetti Bolognesa',
    descripcion: 'Spaghetti con salsa bolognesa casera, preparada con ingredientes frescos',
    peso_porcion: '1 kg',
    precio: 450,
    precio_promocion: 382,
    en_promocion: true,
    imagen_1: 'https://images.unsplash.com/photo-1622973536968-3ead9e780960?w=800',
    activo: true,
    destacado: true,
    orden: 2
  },
  {
    id: 'PROD-003',
    categoria_id: 'CAT-01',
    nombre: 'Spaghetti Alfredo',
    descripcion: 'Spaghetti con cremosa salsa alfredo',
    peso_porcion: '1 kg',
    precio: 450,
    imagen_1: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=800',
    activo: true,
    destacado: false,
    orden: 3
  },
  {
    id: 'PROD-004',
    categoria_id: 'CAT-01',
    nombre: 'Carne encebollada',
    descripcion: 'Carne de res suave y jugosa con cebolla caramelizada',
    peso_porcion: '1 kg',
    precio: 380,
    imagen_1: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800',
    activo: true,
    destacado: false,
    orden: 4
  },
  {
    id: 'PROD-005',
    categoria_id: 'CAT-01',
    nombre: 'Pollo a la crema',
    descripcion: 'Pechuga de pollo en salsa cremosa con especias finas',
    peso_porcion: '1.5 kg',
    precio: 500,
    imagen_1: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800',
    activo: true,
    destacado: true,
    orden: 5
  },
  {
    id: 'PROD-006',
    categoria_id: 'CAT-01',
    nombre: 'Milanesa de pollo',
    descripcion: 'Milanesa de pollo empanizada, crujiente por fuera, jugosa por dentro',
    peso_porcion: '1 kg',
    precio: 420,
    imagen_1: 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=800',
    activo: true,
    destacado: false,
    orden: 6
  },
  {
    id: 'PROD-007',
    categoria_id: 'CAT-01',
    nombre: 'Milanesa de res',
    descripcion: 'Milanesa de res empanizada con pan molido casero',
    peso_porcion: '1 kg',
    precio: 480,
    imagen_1: 'https://images.unsplash.com/photo-1585325701165-351af419e598?w=800',
    activo: true,
    destacado: false,
    orden: 7
  },
  {
    id: 'PROD-008',
    categoria_id: 'CAT-01',
    nombre: 'Tacos dorados',
    descripcion: 'Tacos dorados crujientes rellenos de pollo deshebrado',
    peso_porcion: '0.6 kg',
    precio: 250,
    imagen_1: 'https://images.unsplash.com/photo-1624300629298-e9de39c13be5?w=800',
    activo: true,
    destacado: false,
    orden: 8
  },
  {
    id: 'PROD-009',
    categoria_id: 'CAT-01',
    nombre: 'Pescado empanizado',
    descripcion: 'Filete de pescado empanizado, ligero y delicioso',
    peso_porcion: '1 kg',
    precio: 280,
    imagen_1: 'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?w=800',
    activo: true,
    destacado: false,
    orden: 9
  },
  {
    id: 'PROD-010',
    categoria_id: 'CAT-01',
    nombre: 'Pescado al ajo',
    descripcion: 'Filete de pescado al mojo de ajo con hierbas finas',
    peso_porcion: '1 kg',
    precio: 320,
    imagen_1: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800',
    activo: true,
    destacado: false,
    orden: 10
  },
  {
    id: 'PROD-011',
    categoria_id: 'CAT-01',
    nombre: 'Ensalada estilo árabe',
    descripcion: 'Ensalada fresca estilo árabe con aderezo especial',
    peso_porcion: '0.6 kg',
    precio: 300,
    imagen_1: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800',
    activo: true,
    destacado: false,
    orden: 11
  },
  {
    id: 'PROD-012',
    categoria_id: 'CAT-02',
    nombre: 'Caldo tlalpeño',
    descripcion: 'Caldo tlalpeño tradicional con pollo, verduras y chipotle',
    peso_porcion: '—',
    precio: 260,
    imagen_1: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800',
    activo: true,
    destacado: false,
    orden: 12
  },
  {
    id: 'PROD-013',
    categoria_id: 'CAT-02',
    nombre: 'Crema de brócoli',
    descripcion: 'Crema de brócoli suave y reconfortante',
    peso_porcion: '—',
    precio: 200,
    imagen_1: 'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=800',
    activo: true,
    destacado: false,
    orden: 13
  }
];

export const config = {
  nombre_negocio: 'Malta Delivery',
  tagline: 'Comida casera, hecha con cariño, hasta tu puerta',
  whatsapp_numero: '521XXXXXXXXXX',
  instagram_url: 'https://instagram.com/malta_delivery',
  horario: 'Lunes a Sábado: 10:00 AM - 8:00 PM',
  porciones_texto: 'Porciones para 6-8 personas',
  delivery_zona: 'Zona metropolitana'
};

export const historia = {
  titulo: 'Nuestra Historia',
  parrafos: [
    'Malta nació de una pasión por la cocina casera y el deseo de compartir sabores auténticos con las familias de nuestra ciudad.',
    'Cada platillo es preparado con ingredientes frescos y de la mejor calidad, con el mismo cariño con el que cocinamos para nuestra propia familia.',
    'Nuestro compromiso es llevar comida de verdad, hecha en casa, hasta tu puerta.'
  ],
  frase_destacada: 'Hecha con cariño y la mejor calidad, hasta tu puerta.',
  galeria: [
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
    'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=800',
    'https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=800'
  ]
};
