<template>
  <div class="home">
    <!-- Navegación -->
    <nav class="navbar">
      <div class="navbar-content">
        <div class="logo-space">
          <img src="/verdecocha.ico" alt="Logo" class="navbar-logo" />
        </div>
        <div class="logo">
          <h1 class="logo-title">
            <span class="logo-text">Cajas Comunales</span>
            <span class="logo-subtitle">Verdecocha</span>
          </h1>
        </div>
        <div class="navbar-center"></div>
        <div class="navbar-buttons">
          <router-link to="/login" class="btn-login">Iniciar Sesión</router-link>
          <router-link to="/registros" class="btn-registros">Registrarse</router-link>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <h2>{{ heroTitle }}</h2>
        <p>Un espacio seguro y confiable para gestionar los ahorros en comunidad</p>
        <div class="hero-buttons">
          <router-link to="/login" class="btn-primary">Acceder Ahora</router-link>
          <router-link to="/registros" class="btn-secondary">Registrarse</router-link>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features">
      <div class="feature-card" data-animation="fade-in-up" data-delay="0.1">
        <div class="feature-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L19 6.6C18.8 6.3 18.5 6.1 18.2 6L17 7.8L15.8 7.4C15.5 7.2 15.2 7 14.8 7V5C14.4 5 14.1 4.9 13.8 4.8L12.8 6.2L11.8 5.8C11.5 5.7 11.2 5.5 10.8 5.5V7.5C10.4 7.6 10.1 7.8 9.8 8L8.6 6.8L7.4 7.2C7.1 7.4 6.8 7.6 6.4 7.6L5 7V9L6.4 9.4C6.6 9.7 6.9 9.9 7.2 10L8.4 8.2L9.6 8.6C9.9 8.8 10.2 9 10.6 9V11C11 11 11.3 11.1 11.6 11.2L12.6 9.8L13.6 10.2C13.9 10.3 14.2 10.5 14.6 10.5V8.5C15 8.4 15.3 8.2 15.6 8L16.8 9.2L18 8.8C18.3 8.6 18.6 8.4 19 8.4L21 9ZM12 8C12.55 8 13 8.45 13 9C13 9.55 12.55 10 12 10C11.45 10 11 9.55 11 9C11 8.45 11.45 8 12 8ZM12 11C10.34 11 9 12.34 9 14C9 15.66 10.34 17 12 17C13.66 17 15 15.66 15 14C15 12.34 13.66 11 12 11Z" fill="#0052CC"/>
          </svg>
        </div>
        <h3>Socios</h3>
        <p>Gestiona a los socios y cada unos de los aportes</p>
      </div>
      <div class="feature-card" data-animation="fade-in-up" data-delay="0.2">
        <div class="feature-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L19 6.6C18.8 6.3 18.5 6.1 18.2 6L17 7.8L15.8 7.4C15.5 7.2 15.2 7 14.8 7V5C14.4 5 14.1 4.9 13.8 4.8L12.8 6.2L11.8 5.8C11.5 5.7 11.2 5.5 10.8 5.5V7.5C10.4 7.6 10.1 7.8 9.8 8L8.6 6.8L7.4 7.2C7.1 7.4 6.8 7.6 6.4 7.6L5 7V9L6.4 9.4C6.6 9.7 6.9 9.9 7.2 10L8.4 8.2L9.6 8.6C9.9 8.8 10.2 9 10.6 9V11C11 11 11.3 11.1 11.6 11.2L12.6 9.8L13.6 10.2C13.9 10.3 14.2 10.5 14.6 10.5V8.5C15 8.4 15.3 8.2 15.6 8L16.8 9.2L18 8.8C18.3 8.6 18.6 8.4 19 8.4L21 9ZM12 8C12.55 8 13 8.45 13 9C13 9.55 12.55 10 12 10C11.45 10 11 9.55 11 9C11 8.45 11.45 8 12 8ZM12 11C10.34 11 9 12.34 9 14C9 15.66 10.34 17 12 17C13.66 17 15 15.66 15 14C15 12.34 13.66 11 12 11Z" fill="#DC143C"/>
          </svg>
        </div>
        <h3>Simulador de Créditos</h3>
        <p>Calcula tus cuotas y plazos para préstamos personales</p>
      </div>
      <div class="feature-card" data-animation="fade-in-up" data-delay="0.3">
        <div class="feature-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L3 7V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V7L12 2ZM10 17L6 13L7.41 11.59L10 14.17L16.59 7.58L18 9L10 17Z" fill="#7F3FA8"/>
          </svg>
        </div>
        <h3>Caja Chica</h3>
        <p>Administra los gastos y operaciones de caja menuda</p>
      </div>
      <div class="feature-card" data-animation="fade-in-up" data-delay="0.4">
        <div class="feature-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 4H4C2.89 4 2.01 4.89 2.01 6L2 18C2 19.11 2.89 20 4 20H20C21.11 20 22 19.11 22 18V6C22 4.89 21.11 4 20 4ZM20 18H4V12H20V18ZM20 8H4V6H20V8Z" fill="#28A745"/>
          </svg>
        </div>
        <h3>Préstamos</h3>
        <p>Sistema de créditos y seguimiento de préstamos a miembros</p>
      </div>
    </section>


    <!-- Footer -->
    <footer class="footer">
      <div class="footer-content">
        <div class="footer-section">
          <h4>Cajas Comunales Verdecocha</h4>
          <p>Promoviendo el ahorro colectivo y el desarrollo económico sostenible en comunidades locales.</p>
        </div>
        <div class="footer-section">
          <h4>Enlaces</h4>
          <ul>
            <li><a href="#about">Sobre Nosotros</a></li>
            <li><a href="#features">Características</a></li>
            <li><a href="#contact">Contacto</a></li>
          </ul>
        </div>
        <div class="footer-section">
          <h4>Información Legal</h4>
          <ul>
            <li><a href="#">Política de Privacidad</a></li>
            <li><a href="#">Términos de Servicio</a></li>
            <li><a href="#">Aviso Legal</a></li>
          </ul>
        </div>
        <div class="footer-section">
          <h4>Contacto</h4>
          <p>Email: contacto@cajascomunales.com</p>
          <p>Teléfono: +593 123 456 789</p>
          <p>Dirección: Calle Principal 123, Verdecocha</p>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2025 Cajas Comunales Verdecocha. Todos los derechos reservados.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const showModal = ref(false);
const showContactMenu = ref(false);

// Typewriter effect
const heroTitle = ref('');
const fullTitle = 'Hola, bienvenido a su Sistema de Cajas de Ahorros Comunales';

const typeWriter = (text, i = 0) => {
  if (i < text.length) {
    heroTitle.value += text.charAt(i);
    setTimeout(() => typeWriter(text, i + 1), 50);
  }
};

onMounted(() => {
  // Start typewriter effect
  typeWriter(fullTitle);
});
</script>

<style scoped>
.home {
  min-height: 100vh;
  background: linear-gradient(135deg, #f0f4ff 0%, #fff0f5 100%);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.navbar {
  background: rgba(255, 255, 255, 0.95);
  padding: 1rem 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
}

.navbar-center {
  flex: 1;
}

.navbar-buttons {
  display: flex;
  gap: 1rem;
}

.contact-menu-container {
  position: relative;
  margin-right: 1rem;
}

.contact-menu-btn {
  background: #DC143C;
  color: white;
  border: none;
  padding: 0.7rem 1.5rem;
  border-radius: 5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.contact-menu-btn:hover {
  background: #0052CC;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 82, 204, 0.4);
}

.contact-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  min-width: 280px;
  z-index: 1000;
  padding: 1rem;
  margin-top: 0.5rem;
  border: 1px solid #e0e0e0;
}

.contact-category {
  margin-bottom: 1.5rem;
}

.contact-category:last-child {
  margin-bottom: 0;
}

.contact-category h4 {
  color: #DC143C;
  font-size: 1rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.contact-category p {
  margin: 0.25rem 0;
  color: #666;
  font-size: 0.9rem;
  line-height: 1.4;
}

.logo-space {
  width: 200px;
  height: 80px;
  background: #f5f5f5;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 1rem;
}

.navbar-logo {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.logo h1 {
  color: #DC143C;
  font-size: 1.5rem;
}

.logo-title {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  margin: 0;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.logo-text {
  font-size: 1.5rem;
  background: linear-gradient(135deg, #0052CC 0%, #7F3FA8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-transform: uppercase;
  font-weight: 800;
  letter-spacing: 1px;
}

.logo-subtitle {
  font-size: 1.3rem;
  color: #DC143C;
  font-weight: 600;
  letter-spacing: 1.5px;
  text-transform: capitalize;
  display: block;
}

.btn-login,
.btn-registros {
  padding: 0.7rem 1.5rem;
  color: white;
  text-decoration: none;
  border-radius: 5px;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  font-weight: 600;
  position: relative;
  overflow: hidden;
}

.btn-login {
  background: #0052CC;
  box-shadow: 0 4px 15px rgba(0, 82, 204, 0.3);
}

.btn-login:hover {
  background: #003d99;
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 8px 25px rgba(0, 82, 204, 0.6), 0 0 30px rgba(0, 82, 204, 0.4);
}

.btn-login:active {
  transform: translateY(-1px) scale(0.98);
  box-shadow: 0 2px 10px rgba(0, 82, 204, 0.5);
}

.btn-registros {
  background: #7F3FA8;
  box-shadow: 0 4px 15px rgba(127, 63, 168, 0.3);
}

.btn-registros:hover {
  background: #5a2d7a;
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 8px 25px rgba(0, 82, 204, 0.6), 0 0 30px rgba(0, 82, 204, 0.4);
}

.btn-registros:active {
  transform: translateY(-1px) scale(0.98);
  box-shadow: 0 2px 10px rgba(0, 82, 204, 0.5);
}

@keyframes buttonPulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 4px 15px rgba(0, 82, 204, 0.3);
  }
  50% {
    transform: scale(1.02);
    box-shadow: 0 6px 20px rgba(0, 82, 204, 0.4);
  }
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.logo-title {
  animation: slideInDown 0.8s ease-out;
}

@keyframes buttonPulseBlue {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 4px 15px rgba(0, 82, 204, 0.3);
  }
  50% {
    transform: scale(1.02);
    box-shadow: 0 6px 20px rgba(0, 82, 204, 0.4);
  }
}

.hero {
  position: relative;
  height: 90vh;
  background: linear-gradient(135deg, #0052CC 0%, #7F3FA8 50%, #DC143C 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  text-align: center;
  overflow: hidden;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1;
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 800px;
  padding: 2rem;
  animation: fadeIn 1.5s ease-in;
}

.hero-content h2 {
  font-size: 3rem;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.hero-content p {
  font-size: 1.3rem;
  margin-bottom: 2rem;
}

.hero-buttons {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
}

.btn-primary,
.btn-secondary {
  display: inline-block;
  padding: 1rem 2rem;
  text-decoration: none;
  border-radius: 5px;
  font-weight: 700;
  transition: all 0.3s ease;
  cursor: pointer;
}

.btn-primary {
  background: #DC143C;
  color: white;
}

.btn-primary:hover {
  background: #0052CC;
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(0, 82, 204, 0.3);
}

.btn-secondary {
  background: white;
  color: #003d99;
}

.btn-secondary:hover {
  background: #f8f8f8;
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.features {
  max-width: 1200px;
  margin: 4rem auto;
  padding: 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  animation: slideUp 0.8s ease-out forwards;
  opacity: 0;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.feature-card h3 {
  color: #333;
  margin-bottom: 0.5rem;
}

.feature-card p {
  color: #666;
  line-height: 1.5;
}

.stats {
  max-width: 1200px;
  margin: 4rem auto;
  padding: 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
}

.stat-card {
  background: linear-gradient(135deg, #0052CC 0%, #7F3FA8 100%);
  color: white;
  padding: 2rem;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: scale(1.05);
}

.stat-card h3 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.stat-card p {
  font-size: 1.1rem;
}

.info {
  background: white;
  padding: 4rem 2rem;
}

.info-content {
  max-width: 1200px;
  margin: 0 auto;
}

.info h2 {
  color: #0052CC;
  font-size: 2rem;
  margin-bottom: 2rem;
  text-align: center;
}

.benefits {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.benefits li {
  font-size: 1.1rem;
  color: #333;
  padding: 0.5rem;
  font-weight: 500;
}

.additional-info {
  font-size: 1.1rem;
  color: #666;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  text-align: center;
}

.about {
  max-width: 1200px;
  margin: 6rem auto 4rem;
  padding: 4rem 2rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.about-content h2 {
  color: #0052CC;
  font-size: 2rem;
  margin-bottom: 1.5rem;
  text-align: center;
}

.about-content p {
  font-size: 1.1rem;
  color: #666;
  line-height: 1.6;
  margin-bottom: 1rem;
  text-align: center;
}

.about-intro {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  font-weight: 500;
}

.about-values {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.value-item {
  text-align: center;
  background: #f9f9f9;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease;
}

.value-item:hover {
  transform: translateY(-5px);
}

.value-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.value-item h3 {
  color: #0052CC;
  margin-bottom: 0.5rem;
  font-size: 1.3rem;
}

.value-item p {
  color: #666;
  line-height: 1.5;
}

.about-closing {
  font-size: 1.1rem;
  font-weight: 500;
  color: #333;
  text-align: center;
}

.contact-section {
  text-align: center;
  margin-top: 2rem;
}

.contact-btn {
  background: #0052CC;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 5px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.contact-btn:hover {
  background: #003d99;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 82, 204, 0.4);
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  max-width: 400px;
  width: 90%;
  position: relative;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.close {
  position: absolute;
  top: 10px;
  right: 15px;
  font-size: 2rem;
  cursor: pointer;
  color: #333;
}

.close:hover {
  color: #0052CC;
}

.modal-content h3 {
  color: #0052CC;
  margin-bottom: 1.5rem;
  text-align: center;
}

.modal-content p {
  margin-bottom: 0.5rem;
  font-size: 1rem;
  color: #666;
}

.footer {
  background: #333;
  color: white;
  padding: 3rem 2rem 1rem;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.footer-section h4 {
  color: #0052CC;
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.footer-section p {
  color: #ccc;
  line-height: 1.6;
  margin-bottom: 0.5rem;
}

.footer-section ul {
  list-style: none;
  padding: 0;
}

.footer-section ul li {
  margin-bottom: 0.5rem;
}

.footer-section ul li a {
  color: #ccc;
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-section ul li a:hover {
  color: #0052CC;
}

.footer-bottom {
  border-top: 1px solid #555;
  padding-top: 1rem;
  text-align: center;
}

.footer-bottom p {
  color: #ccc;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .hero {
    height: 60vh;
  }

  .hero-content h2 {
    font-size: 2rem;
  }

  .hero-content p {
    font-size: 1rem;
  }

  .hero-buttons {
    flex-direction: column;
    gap: 1rem;
  }

  .navbar-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .navbar-buttons {
    justify-content: center;
  }
}
</style>
