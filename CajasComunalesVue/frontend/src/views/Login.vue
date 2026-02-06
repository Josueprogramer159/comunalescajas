<template>
  <div class="login-container">
    <!-- Sección izquierda: Formulario de login -->
    <div class="login-content">
      <div class="login-form-section">
        <div class="logo-area">
          <img src="/logoWeb.png" alt="Logo Cajas Comunales" class="logo-img">
        </div>
        <div class="form-header">
          <h1>Acceso al Sistema</h1>
          <p>Ingrese sus credenciales para continuar</p>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="login-email">Usuario</label>
            <div class="input-group">
              <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <input
                v-model="loginForm.email"
                type="email"
                id="login-email"
                placeholder="usuario@ejemplo.com"
                required
              />
            </div>
          </div>

          <div class="form-group">
            <label for="login-password">Contraseña</label>
            <div class="input-group">
              <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <input
                v-model="loginForm.password"
                :type="showPassword ? 'text' : 'password'"
                id="login-password"
                placeholder="Ingrese su contraseña"
                required
              />
            </div>
          </div>

          <button type="submit" class="btn-submit" :disabled="isLoading">
            <span v-if="isLoading" class="spinner"></span>
            {{ isLoading ? 'Verificando...' : 'Ingresar' }}
          </button>
        </form>

        <transition name="fade-in">
          <div v-if="errorMessage" class="alert alert-error">
            <svg class="alert-icon" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="10"></circle>
              <text x="12" y="16" text-anchor="middle" font-size="14" fill="white" font-weight="bold">!</text>
            </svg>
            <div>{{ errorMessage }}</div>
          </div>
        </transition>

        <transition name="fade-in">
          <div v-if="successMessage" class="alert alert-success">
            <svg class="alert-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.2L4.8 12m-1.4 1.4L9 19 21 7"></path>
            </svg>
            <div>{{ successMessage }}</div>
          </div>
        </transition>

        <div class="auth-footer">
          <p>¿No tienes cuenta? <router-link to="/registros" class="auth-link">Crear cuenta</router-link></p>
        </div>

        <div class="forgot-password-section">
          <button @click="showAdminMessage = true" class="btn-forgot-password">
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        <transition name="fade-in">
          <div v-if="showAdminMessage" class="alert alert-info admin-message">
            <svg class="alert-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>
            <div>Pónganse en contacto con el administrador del sistema para reestablecer la contraseña</div>
          </div>
        </transition>

        <router-link to="/" class="back-home">← Volver al Inicio</router-link>
      </div>
    </div>

    <!-- Sección derecha: Logo e información -->
    <div class="login-sidebar">
      <div class="sidebar-content">
        <div class="logo-area">
          <h2>Cajas Comunales<br>Verdecocha</h2>
        </div>

        <div class="features">
          <div class="feature">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                <path d="M2 12h20"></path>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
              </svg>
            </div>
            <h3>Gestión Integral</h3>
            <p>Controla todos los aspectos de tu caja comunal desde un único lugar</p>
          </div>

          <div class="feature">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <h3>Seguridad Total</h3>
            <p>Tus datos están protegidos con encriptación de nivel empresarial</p>
          </div>

          <div class="feature">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <polyline points="19 12 12 19 5 12"></polyline>
              </svg>
            </div>
            <h3>Reportes Claros</h3>
            <p>Accede a análisis detallados y reportes en tiempo real</p>
          </div>
        </div>

        <div class="sidebar-footer">
          <p class="small-text">© 2024 Cajas Comunales. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const errorMessage = ref('')
const successMessage = ref('')
const isLoading = ref(false)
const showPassword = ref(false)
const showAdminMessage = ref(false)

const loginForm = ref({
  email: '',
  password: ''
})


const handleLogin = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  if (!loginForm.value.email || !loginForm.value.password) {
    errorMessage.value = 'Por favor completa todos los campos'
    return
  }

  isLoading.value = true

  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        email: loginForm.value.email,
        password: loginForm.value.password
      })
    })

    if (response.status === 429) {
      const error = await response.json()
      errorMessage.value = error.message || 'Demasiados intentos. Intenta de nuevo más tarde.'
      return
    }

    if (!response.ok) {
      const error = await response.json()
      errorMessage.value = error.message || 'Error al iniciar sesión'
      return
    }

    const data = await response.json()

    if (data.success) {
      sessionStorage.setItem('accessToken', data.accessToken)
      sessionStorage.setItem('authUser', JSON.stringify({
        id: data.user.id,
        name: data.user.name,
        email: data.user.email
      }))

      successMessage.value = '¡Bienvenido! Redirigiendo...'

      setTimeout(() => {
        router.push('/dashboard')
      }, 1000)
    } else {
      errorMessage.value = data.message || 'Error al iniciar sesión'
    }
  } catch (error) {
    console.error('Error:', error)
    errorMessage.value = 'Error de conexión. Verifica que el servidor esté corriendo.'
  } finally {
    isLoading.value = false
  }
}



</script>

<style scoped>
* {
  box-sizing: border-box;
}

.login-container {
  height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: linear-gradient(135deg, rgba(13, 71, 161, 0.8) 0%, rgba(183, 28, 28, 0.8) 50%, rgba(69, 39, 160, 0.8) 100%);
  overflow: hidden;
}

.login-content {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  background: white;
}

.login-form-section {
  width: 100%;
  max-width: 420px;
  text-align: center;
}

.form-header {
  margin-bottom: 2rem;
  text-align: center;
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

.login-form {
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
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
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

/* Forgot Password Styles */
.forgot-password-section {
  text-align: center;
  margin-top: 1.5rem;
}

.btn-forgot-password {
  background: none;
  border: none;
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  text-decoration: underline;
  transition: all 0.3s ease;
  padding: 0.5rem;
  border-radius: 4px;
}

.btn-forgot-password:hover {
  color: #0D47A1;
  background: rgba(13, 71, 161, 0.05);
}

.admin-message {
  margin-top: 1rem;
  background: #eff6ff;
  color: #1e40af;
  border: 1px solid #bfdbfe;
}

.admin-message .alert-icon {
  color: #2563eb;
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

/* Sidebar */
.login-sidebar {
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
  width: 250px;
  height: 100px;
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

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  width: 100%;
  max-width: 450px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border: 1px solid #e5e7eb;
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-50px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f1f5f9;
}

.modal-header h3 {
  color: #0D47A1;
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #6b7280;
  padding: 0.25rem;
  border-radius: 6px;
  transition: all 0.3s ease;
  line-height: 1;
}

.modal-close:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-body {
  color: #1f2937;
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
  .login-container {
    grid-template-columns: 1fr;
  }

  .login-content,
  .login-sidebar {
    padding: 2rem 1.5rem;
  }

  .form-header h1 {
    font-size: 1.75rem;
  }

  .login-form-section {
    max-width: 100%;
  }

  .logo-area {
    margin-bottom: 2rem;
  }

  .logo-img {
    width: 200px;
    height: 200px;
  }

  .logo-area h2 {
    font-size: 1.5rem;
  }

  .features {
    gap: 1.5rem;
  }
}

@media (max-width: 480px) {
  .login-container {
    min-height: auto;
  }

  .login-content,
  .login-sidebar {
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
    height: 150px;
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

  .modal-content {
    margin: 1rem;
    padding: 1.5rem;
  }
}
</style>
