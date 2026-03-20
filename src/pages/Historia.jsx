import { historia } from '../data/menuData';
import './Historia.css';

export default function Historia() {
  return (
    <main className="historia-page">
      {/* Hero */}
      <section className="historia-hero">
        <div className="historia-hero-overlay"></div>
        <div className="historia-hero-content">
          <h1>{historia.titulo}</h1>
        </div>
      </section>

      {/* Content */}
      <section className="historia-content">
        <div className="historia-container">
          <div className="historia-text">
            {historia.parrafos.map((parrafo, index) => (
              <p key={index}>{parrafo}</p>
            ))}
          </div>

          <blockquote className="historia-quote">
            "{historia.frase_destacada}"
          </blockquote>
        </div>
      </section>

      {/* Galería */}
      <section className="historia-galeria">
        <div className="galeria-container">
          <h2>Nuestro Proceso</h2>
          <div className="galeria-grid">
            {historia.galeria.map((imagen, index) => (
              <div key={index} className="galeria-item">
                <img src={imagen} alt={`Proceso ${index + 1}`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="historia-valores">
        <div className="valores-container">
          <h2>Nuestros Valores</h2>
          <div className="valores-grid">
            <div className="valor">
              <div className="valor-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </div>
              <h3>Cariño</h3>
              <p>Cada platillo es preparado con el amor que le ponemos a la comida de nuestra propia familia.</p>
            </div>

            <div className="valor">
              <div className="valor-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                </svg>
              </div>
              <h3>Calidad</h3>
              <p>Seleccionamos los mejores ingredientes para garantizar el mejor sabor en cada bocado.</p>
            </div>

            <div className="valor">
              <div className="valor-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </div>
              <h3>Frescura</h3>
              <p>Cocinamos diariamente con ingredientes frescos para ofrecerte lo mejor.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
