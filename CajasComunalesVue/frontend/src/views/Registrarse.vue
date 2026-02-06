<template>
  <div class="register-container">
    <!-- Formulario -->
    <div class="register-content">
      <transition name="fade-in">
        <div class="register-form-section" v-if="showContent">
          <div class="logo-area">
            <img src="/logoWeb.png" alt="Cajas Comunales Verdecocha" class="logo-img" />
          </div>
          <div class="form-header">
            <h1>Crear Cuenta</h1>
            <p>Únete a Cajas Comunales Verdecocha</p>
          </div>

          <form @submit.prevent="handleRegister" class="register-form">
            <!-- Nombre -->
            <div class="form-group">
              <label for="nombre">Nombre Completo</label>
              <div class="input-group">
                <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke-width="2" stroke-linecap="round"/>
                  <circle cx="12" cy="7" r="4" stroke-width="2"/>
                </svg>
                <input v-model="registerForm.nombre" type="text" id="nombre" placeholder="Tu nombre completo" required />
              </div>
            </div>

            <!-- Email -->
            <div class="form-group">
              <label for="email">Correo Electrónico</label>
              <div class="input-group">
                <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="2" y="4" width="20" height="16" rx="2" stroke-width="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <input v-model="registerForm.email" type="email" id="email" placeholder="tu@email.com" required />
              </div>
            </div>

            <!-- Contraseña -->
            <div class="form-group">
              <label for="password">Contraseña</label>
              <div class="input-group">
                <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke-width="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <input v-model="registerForm.password" type="password" id="password" placeholder="Mínimo 10 caracteres, una mayuscula y un simbolo" required />
              </div>
              <div class="password-hint">
                <span :class="{ valid: registerForm.password.length >= 6 }">
                  {{ registerForm.password.length >= 6 ? '✓' : '○' }} Al menos 6 caracteres
                </span>
              </div>
            </div>

            <!-- Repetir Contraseña -->
            <div class="form-group">
              <label for="confirmPassword">Repetir Contraseña</label>
              <div class="input-group">
                <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke-width="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <input v-model="registerForm.confirmPassword" type="password" id="confirmPassword" placeholder="Repite tu contraseña" required />
              </div>
              <div class="password-hint" v-if="registerForm.confirmPassword">
                <span :class="{ valid: registerForm.password === registerForm.confirmPassword }">
                  {{ registerForm.password === registerForm.confirmPassword ? '✓' : '✗' }}
                  {{ registerForm.password === registerForm.confirmPassword ? 'Las contraseñas coinciden' : 'Las contraseñas no coinciden' }}
                </span>
              </div>
            </div>

            <!-- Mensajes -->
            <transition name="fade-in">
              <div v-if="errorMessage" class="alert alert-error">
                <svg viewBox="0 0 24 24" fill="currentColor" class="alert-icon">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 8v4M12 16h.01" fill="white" stroke="white" stroke-width="2"/>
                </svg>
                {{ errorMessage }}
              </div>
            </transition>

            <transition name="fade-in">
              <div v-if="successMessage" class="alert alert-success">
                <svg viewBox="0 0 24 24" fill="currentColor" class="alert-icon">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                {{ successMessage }}
              </div>
            </transition>

            <!-- Botón Submit -->
            <button type="submit" class="btn-submit" :disabled="isLoading">
              <span v-if="isLoading" class="spinner"></span>
              <span>{{ isLoading ? 'Registrando...' : 'Crear Cuenta' }}</span>
            </button>
          </form>

          <!-- Link a Login -->
          <div class="auth-footer">
            <p>¿Ya tienes cuenta? <router-link to="/login" class="auth-link">Inicia sesión aquí</router-link></p>
          </div>

          <router-link to="/" class="back-home">← Volver al Inicio</router-link>
        </div>
      </transition>
    </div>

    <!-- Panel Informativo -->
    <div class="register-sidebar">
      <transition name="fade-in-right">
        <div v-if="showContent" class="sidebar-content">          <div class="logo-area">
            <h2>Cajas Comunales<br>Verdecocha</h2>
          </div>

          <div class="features">
            <div class="feature">
              <div class="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2v20M2 12h20"/>
                </svg>
              </div>
              <h3>Gestión Financiera</h3>
              <p>Controla tus ahorros y préstamos de forma segura</p>
            </div>

            <div class="feature">
              <div class="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 11l3 3L22 4"/>
                  <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h3>Reportes Automáticos</h3>
              <p>Recibe información actualizada sobre tu cuenta</p>
            </div>

            <div class="feature">
              <div class="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <h3>Datos Protegidos</h3>
              <p>Tu información está segura con encriptación avanzada</p>
            </div>
          </div>

          <div class="sidebar-footer">
            <p class="small-text">Al registrarte, aceptas nuestros términos de servicio</p>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const errorMessage = ref('')
const successMessage = ref('')
const isLoading = ref(false)
const showContent = ref(false)

const registerForm = ref({
  nombre: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const handleRegister = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  if (!registerForm.value.nombre || !registerForm.value.email || !registerForm.value.password || !registerForm.value.confirmPassword) {
    errorMessage.value = 'Por favor completa todos los campos'
    return
  }

  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    errorMessage.value = 'Las contraseñas no coinciden'
    return
  }

  if (registerForm.value.password.length < 6) {
    errorMessage.value = 'La contraseña debe tener al menos 6 caracteres'
    return
  }

  isLoading.value = true

  try {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nombre: registerForm.value.nombre,
        email: registerForm.value.email,
        password: registerForm.value.password
      })
    })

    const data = await response.json()

    if (!response.ok) {
      errorMessage.value = data.message || 'Error al registrarse'
      return
    }

    if (data.success) {
      successMessage.value = 'Registro exitoso. Redirigiendo al login...'
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } else {
      errorMessage.value = data.message || 'Error al registrarse'
    }
  } catch (error) {
    console.error('Error:', error)
    errorMessage.value = 'Error de conexión. Verifica que el servidor esté corriendo.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  showContent.value = true
})
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.register-container {
  height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: linear-gradient(135deg, rgba(13, 71, 161, 0.8) 0%, rgba(183, 28, 28, 0.8) 50%, rgba(69, 39, 160, 0.8) 100%);
  overflow: hidden;
}

.register-content {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  background: white;
}

.register-form-section {
  width: 100%;
  max-width: 420px;
}

.form-header {
  margin-bottom: 2rem;
}

.form-header h1 {
  font-size: 2rem;
  font-weight: 800;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.02em;
}

.form-header p {
  font-size: 0.95rem;
  color: #6b7280;
  margin: 0;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  letter-spacing: 0.5px;
}

.input-group {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 1rem;
  width: 1.25rem;
  height: 1.25rem;
  color: #d1d5db;
  pointer-events: none;
  flex-shrink: 0;
}

.form-group input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 3.25rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 0.95rem;
  font-family: inherit;
  transition: all 0.3s ease;
  background: #f9fafb;
}

.form-group input:focus {
  outline: none;
  background: white;
  border-color: #0D47A1;
  box-shadow: 0 0 0 3px rgba(13, 71, 161, 0.1);
}

.form-group input::placeholder {
  color: #9ca3af;
}

.password-hint {
  font-size: 0.8rem;
  color: #9ca3af;
  padding: 0 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.password-hint span {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: color 0.3s ease;
}

.password-hint span.valid {
  color: #10b981;
  font-weight: 600;
}

.alert {
  padding: 1rem;
  border-radius: 10px;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  font-size: 0.9rem;
  line-height: 1.5;
  animation: slideDown 0.3s ease;
}

.alert-icon {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.alert-error {
  background: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.alert-error .alert-icon {
  color: #dc2626;
}

.alert-success {
  background: #f0fdf4;
  color: #15803d;
  border: 1px solid #bbf7d0;
}

.alert-success .alert-icon {
  color: #16a34a;
}

.btn-submit {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #0D47A1 0%, #B71C1C 50%, #4527A0 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  letter-spacing: 0.5px;
  margin-top: 0.5rem;
}

.btn-submit:hover:not(:disabled) {
  background: linear-gradient(135deg, #0D47A1 0%, #4527A0 50%, #B71C1C 100%);
  transform: translateY(-3px);
  box-shadow: 0 15px 30px -5px rgba(13, 71, 161, 0.6);
}

.btn-submit:active:not(:disabled) {
  transform: translateY(0);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.auth-footer {
  text-align: center;
  margin-top: 1.5rem;
  color: #6b7280;
  font-size: 0.9rem;
}

.auth-footer p {
  margin: 0;
}

.auth-link {
  background: linear-gradient(135deg, #0D47A1 0%, #B71C1C 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
}

.auth-link:hover {
  background: linear-gradient(135deg, #B71C1C 0%, #0D47A1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Sidebar */
.register-sidebar {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  background: linear-gradient(135deg, rgba(13, 71, 161, 0.8) 0%, rgba(183, 28, 28, 0.8) 50%, rgba(69, 39, 160, 0.8) 100%);
  color: white;
}

.sidebar-content {
  width: 100%;
  max-width: 380px;
}

.logo-area {
  text-align: center;
  margin-bottom: 0.25rem;
}

.logo-img {
  width: 300px;
  height: 70px;
  object-fit: contain;
  margin-bottom: 1rem;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15));
}

.logo-area h2 {
  font-size: 1.75rem;
  font-weight: 800;
  margin: 0;
  line-height: 1.3;
  letter-spacing: -0.02em;
}

.features {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
  margin-bottom: 2rem;
}

.feature {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.feature-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.75rem;
  flex-shrink: 0;
}

.feature-icon svg {
  width: 1.5rem;
  height: 1.5rem;
}

.feature h3 {
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
}

.feature p {
  font-size: 0.875rem;
  margin: 0;
  opacity: 0.9;
  line-height: 1.5;
}

.sidebar-footer {
  text-align: center;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.small-text {
  font-size: 0.8rem;
  margin: 0;
  opacity: 0.85;
}

/* Animaciones */
.fade-in-enter-active,
.fade-in-right-enter-active {
  transition: all 0.6s ease-out;
}

.fade-in-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-in-right-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.fade-in-leave-active,
.fade-in-right-leave-active {
  transition: all 0.3s ease-in;
}

.fade-in-leave-to,
.fade-in-right-leave-to {
  opacity: 0;
}

.back-home {
  background: linear-gradient(135deg, #0D47A1 0%, #B71C1C 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  padding: 0.5rem 1.25rem;
  border-radius: 6px;
  font-size: 0.95rem;
  margin-top: 2.5rem;
  display: block;
  text-align: center;
}

.back-home:hover {
  background: linear-gradient(135deg, #B71C1C 0%, #0D47A1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  transform: scale(1.05);
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .register-container {
    grid-template-columns: 1fr;
  }

  .register-content,
  .register-sidebar {
    padding: 2rem 1.5rem;
  }

  .form-header h1 {
    font-size: 1.75rem;
  }

  .register-form-section {
    max-width: 100%;
  }

  .logo-area {
    margin-bottom: 2rem;
  }

  .logo-img {
    width: 200px;
    height: 200px;
  }

  .features {
    gap: 1.5rem;
  }
}

@media (max-width: 480px) {
  .register-container {
    min-height: auto;
  }

  .register-content,
  .register-sidebar {
    padding: 1.5rem 1rem;
  }

  .form-header h1 {
    font-size: 1.5rem;
  }

  .form-group input {
    padding: 0.75rem 0.875rem 0.75rem 3rem;
    font-size: 0.875rem;
  }

  .input-icon {
    left: 0.75rem;
    width: 1.125rem;
    height: 1.125rem;
  }

  .btn-submit {
    padding: 0.875rem;
    font-size: 0.875rem;
  }

  .logo-img {
    width: 150px;
    height: 70px;
  }

  .logo-area h2 {
    font-size: 1.25rem;
  }

  .feature-icon {
    width: 2.5rem;
    height: 2.5rem;
  }

  .feature h3 {
    font-size: 0.9rem;
  }

  .feature p {
    font-size: 0.8rem;
  }

  .back-home {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }
}
</style>
