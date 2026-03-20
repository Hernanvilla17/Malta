import { createContext, useContext, useState, useEffect } from 'react';
import {
  productos as productosDefault,
  categorias as categoriasDefault,
} from '../data/menuData';

const SHEETS_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vSpD3zGK5kXrFQC6DjPgTADh6SL7r3eAXalvSU0IDYCC4OMm1DUbf5Rg6yjHnvwhT4L2SzoZT6G6t7C/pub?gid=105703107&single=true&output=csv';

const MenuDataContext = createContext();

// Simple CSV parser that handles quoted fields
function parseCSV(text) {
  const rows = [];
  let current = '';
  let inQuotes = false;
  let row = [];

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      if (inQuotes && text[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(current.trim());
      current = '';
    } else if (char === '\n' && !inQuotes) {
      row.push(current.trim());
      rows.push(row);
      row = [];
      current = '';
    } else if (char !== '\r') {
      current += char;
    }
  }
  // Last field/row
  if (current || row.length > 0) {
    row.push(current.trim());
    rows.push(row);
  }
  return rows;
}

function parsePrecio(val) {
  if (!val) return 0;
  return parseFloat(val.replace(/[$,]/g, '')) || 0;
}

function parseBool(val) {
  return String(val).toUpperCase() === 'TRUE';
}

function csvToProductos(rows) {
  // Row 0: title row, Row 1: headers, Row 2: instructions, Row 3+: data
  const dataRows = rows.slice(3);
  const productos = [];
  const categoriasSet = new Map();

  for (const cols of dataRows) {
    if (!cols[0] || cols[0].trim() === '') continue;

    const id = cols[0];
    const categoriaNombre = cols[1] || '';
    const nombre = cols[2] || '';
    const descripcion = cols[3] || '';
    const peso_porcion = cols[4] || '';
    const precio = parsePrecio(cols[5]);
    const precio_promocion = parsePrecio(cols[6]);
    const en_promocion = parseBool(cols[7]);
    const activo = parseBool(cols[8]);
    const destacado = parseBool(cols[9]);
    const orden = parseInt(cols[10]) || 0;
    const imagen_1 = cols[11] || '';
    const imagen_2 = cols[12] || '';
    const imagen_3 = cols[13] || '';

    // Build categoria_id from nombre
    if (categoriaNombre && !categoriasSet.has(categoriaNombre)) {
      const catId = `CAT-${String(categoriasSet.size + 1).padStart(2, '0')}`;
      categoriasSet.set(categoriaNombre, catId);
    }
    const categoria_id = categoriasSet.get(categoriaNombre) || 'CAT-01';

    productos.push({
      id,
      categoria_id,
      nombre,
      descripcion,
      peso_porcion,
      precio,
      precio_promocion: precio_promocion || undefined,
      en_promocion,
      imagen_1: imagen_1 || '',
      imagen_2: imagen_2 || undefined,
      imagen_3: imagen_3 || undefined,
      activo,
      destacado,
      orden,
    });
  }

  const categorias = [];
  let catOrden = 1;
  for (const [nombre, id] of categoriasSet) {
    categorias.push({ id, nombre, orden: catOrden++, activo: true });
  }

  return { productos, categorias };
}

export function MenuDataProvider({ children }) {
  const [productos, setProductos] = useState(productosDefault);
  const [categorias, setCategorias] = useState(categoriasDefault);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch(SHEETS_CSV_URL)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch menu');
        return res.text();
      })
      .then((csv) => {
        if (cancelled) return;
        const rows = parseCSV(csv);
        const data = csvToProductos(rows);
        if (data.productos.length > 0) {
          setProductos(data.productos);
          setCategorias(data.categorias);
        }
      })
      .catch((err) => {
        console.warn('Error cargando menú desde Google Sheets, usando datos locales:', err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <MenuDataContext.Provider value={{ productos, categorias, loading }}>
      {children}
    </MenuDataContext.Provider>
  );
}

export function useMenuData() {
  const context = useContext(MenuDataContext);
  if (!context) {
    throw new Error('useMenuData must be used within a MenuDataProvider');
  }
  return context;
}
