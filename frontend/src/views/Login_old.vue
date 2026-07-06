<template>
  <div class="login-container">
    <!-- Sección izquierda: Formulario de login -->
    <div class="login-content">
      <div class="login-form-section">
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
          <button @click="showForgotPasswordModal = true" class="auth-link" style="background: none; border: none; padding: 0; cursor: pointer;">
            ¿Olvidaste tu contraseña?
          </button>
        </div>
      </div>
    </div>

    <!-- Sección derecha: Logo e información -->
    <div class="login-sidebar">
      <div class="sidebar-content">
        <div class="logo-area">
          <img src="/logoWeb.png" alt="Logo Cajas Comunales" class="logo-img">
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

    <!-- Modal de recuperación de contraseña -->
    <div v-if="showForgotPasswordModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Recuperación de Contraseña</h3>
          <button @click="closeModal" class="modal-close">&times;</button>
        </div>

        <!-- Paso 1: Verificar credenciales -->
        <div v-if="!showNewPasswordModal" class="modal-body">
          <p style="margin-bottom: 1.5rem; color: #4b5563; text-align: center;">
            Ingrese sus credenciales actuales para verificar su identidad
          </p>

          <form @submit.prevent="verifyCurrentCredentials" class="login-form">
            <div class="form-group">
              <label>Correo Electrónico</label>
              <div class="input-group">
                <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <input
                  v-model="recoveryForm.email"
                  type="email"
                  placeholder="usuario@ejemplo.com"
                  required
                />
              </div>
            </div>

            <div class="form-group">
              <label>Contraseña Actual</label>
              <div class="input-group">
                <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <input
                  v-model="recoveryForm.currentPassword"
                  type="password"
                  placeholder="Ingrese su contraseña actual"
                  required
                />
              </div>
            </div>

            <button type="submit" class="btn-submit" :disabled="recoveryLoading">
              <span v-if="recoveryLoading" class="spinner"></span>
              {{ recoveryLoading ? 'Verificando...' : 'Verificar' }}
            </button>
          </form>

          <div v-if="recoveryError" class="alert alert-error" style="margin-top: 1rem;">
            <svg class="alert-icon" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="10"></circle>
              <text x="12" y="16" text-anchor="middle" font-size="14" fill="white" font-weight="bold">!</text>
            </svg>
            <div>{{ recoveryError }}</div>
          </div>
        </div>

        <!-- Paso 2: Cambiar contraseña -->
        <div v-else class="modal-body">
          <p style="margin-bottom: 1.5rem; color: #4b5563; text-align: center;">
            Credenciales verificadas. Ingrese su nueva contraseña
          </p>

          <form @submit.prevent="changePassword" class="login-form">
            <div class="form-group">
              <label>Nueva Contraseña</label>
              <div class="input-group">
                <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <input
                  v-model="recoveryForm.newPassword"
                  type="password"
                  placeholder="Ingrese nueva contraseña"
                  required
                />
              </div>
            </div>

            <div class="form-group">
              <label>Confirmar Contraseña</label>
              <div class="input-group">
                <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <input
                  v-model="recoveryForm.confirmNewPassword"
                  type="password"
                  placeholder="Confirme la contraseña"
                  required
                />
              </div>
            </div>

            <button type="submit" class="btn-submit" :disabled="recoveryLoading">
              <span v-if="recoveryLoading" class="spinner"></span>
              {{ recoveryLoading ? 'Cambiando...' : 'Cambiar Contraseña' }}
            </button>
          </form>

          <div v-if="recoveryError" class="alert alert-error" style="margin-top: 1rem;">
            <svg class="alert-icon" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="10"></circle>
            </svg>
            <div>{{ recoveryError }}</div>
          </div>

          <div v-if="recoverySuccess" class="alert alert-success" style="margin-top: 1rem;">
            <svg class="alert-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.2L4.8 12m-1.4 1.4L9 19 21 7"></path>
            </svg>
            <div>{{ recoverySuccess }}</div>
          </div>
        </div>
      </div>
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
const showPassword = ref(false)
const showForgotPasswordModal = ref(false)
const showNewPasswordModal = ref(false)
const recoveryLoading = ref(false)
const recoveryError = ref('')
const recoverySuccess = ref('')

const loginForm = ref({
  email: '',
  password: ''
})

const recoveryForm = ref({
  email: '',
  currentPassword: '',
  newPassword: '',
  confirmNewPassword: ''
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
      credentials: 'include', // Habilitar cookies
      body: JSON.stringify({
        email: loginForm.value.email,
        password: loginForm.value.password
      })
    })

    // Manejar rate limiting (429 Too Many Requests)
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
      // Guardar access token en sessionStorage
      sessionStorage.setItem('accessToken', data.accessToken)
      
      // Guardar información del usuario
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
    errorMessage.value = 'Error de conexión. Verifica que:\n1. El servidor esté corriendo: npm run dev (en carpeta backend)\n2. PostgreSQL esté activo\n3. La tabla administradores tenga datos'
  } finally {
    isLoading.value = false
  }
}

const closeModals = () => {
  showForgotPasswordModal.value = false
  showNewPasswordModal.value = false
  recoveryError.value = ''
  recoverySuccess.value = ''
  recoveryForm.value = {
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  }
}

const verifyCurrentCredentials = async () => {
  recoveryError.value = ''
  recoverySuccess.value = ''

  if (!recoveryForm.value.email || !recoveryForm.value.currentPassword) {
    recoveryError.value = 'Por favor completa todos los campos'
    return
  }

  recoveryLoading.value = true

  try {
    // Verificar que las credenciales existan en la base de datos
    const response = await fetch('/api/verify-credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: recoveryForm.value.email,
        password: recoveryForm.value.currentPassword
      })
    })

    const data = await response.json()

    if (!response.ok) {
      recoveryError.value = data.message || 'Credenciales inválidas'
      return
    }

    if (data.success) {
      // Credenciales válidas, mostrar modal de nueva contraseña
      showNewPasswordModal.value = true
      recoveryError.value = ''
    } else {
      recoveryError.value = data.message || 'Credenciales inválidas'
    }
  } catch (error) {
    console.error('Error en verificación:', error)
    recoveryError.value = 'Error de conexión. Verifica que el servidor esté corriendo.'
  } finally {
    recoveryLoading.value = false
  }
}

const changePassword = async () => {
  recoveryError.value = ''
  recoverySuccess.value = ''

  if (!recoveryForm.value.newPassword || !recoveryForm.value.confirmNewPassword) {
    recoveryError.value = 'Por favor completa todos los campos'
    return
  }

  if (recoveryForm.value.newPassword !== recoveryForm.value.confirmNewPassword) {
    recoveryError.value = 'Las contraseñas no coinciden'
    return
  }

  if (recoveryForm.value.newPassword.length < 6) {
    recoveryError.value = 'La contraseña debe tener al menos 6 caracteres'
    return
  }

  recoveryLoading.value = true

  try {
    const response = await fetch('/api/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: recoveryForm.value.email,
        currentPassword: recoveryForm.value.currentPassword,
        newPassword: recoveryForm.value.newPassword
      })
    })

    const data = await response.json()

    if (!response.ok) {
      recoveryError.value = data.message || 'Error al cambiar contraseña'
      return
    }

    if (data.success) {
      recoverySuccess.value = 'Contraseña cambiada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.'
      recoveryError.value = ''

      // Limpiar el modal después de 3 segundos
      setTimeout(() => {
        closeModals()
      }, 3000)
    } else {
      recoveryError.value = data.message || 'Error al cambiar contraseña'
    }
  } catch (error) {
    console.error('Error en cambio de contraseña:', error)
    recoveryError.value = 'Error de conexión. Verifica que el servidor esté corriendo.'
  } finally {
    recoveryLoading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: linear-gradient(
    135deg,
    #0a2f6b 0%,
    #0f5fa8 35%,
    #5a4a8a 60%,
    #b31224 100%
  );
  overflow: hidden;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.login-wrapper {
  display: contents;
}

/* Animaciones */
.fade-slide-left-enter-active,
.fade-slide-right-enter-active,
.fade-enter-active {
  transition: all 0.6s ease-out;
}

.fade-slide-left-enter-from {
  opacity: 0;
  transform: translateX(-50px);
}

.fade-slide-right-enter-from {
  opacity: 0;
  transform: translateX(50px);
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-slide-left-leave-active,
.fade-slide-right-leave-active,
.fade-leave-active {
  transition: all 0.3s ease-in;
}

.fade-slide-left-leave-to,
.fade-slide-right-leave-to,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Sección izquierda: Logo e información */
.login-left {
  flex: 1;
  background: linear-gradient(135deg, rgba(13, 71, 161, 0.8) 0%, rgba(183, 28, 28, 0.8) 50%, rgba(69, 39, 160, 0.8) 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
}

.brand-section {
  text-align: center;
  max-width: 400px;
  width: 100%;
}

.logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  gap: 0rem;
}

.logo-icon {
  width: 450px;
  height: 150px;
  object-fit: contain;
  filter: drop-shadow(0 0px 0px rgba(0, 0, 0, 0.25));
}

.brand-section h1 {
  font-size: 2.25rem;
  margin: 0;
  font-weight: 800;
  letter-spacing: -0.025em;
}

.brand-subtitle {
  font-size: 1.1rem;
  margin: 0.75rem 0 2.5rem 0;
  opacity: 0.95;
  font-weight: 500;
}

.brand-info h3 {
  font-size: 1.5rem;
  margin-bottom: 1.25rem;
  font-weight: 700;
}

.brand-info ul {
  list-style: none;
  padding: 0;
  text-align: left;
  max-width: 300px;
  margin: 0 auto;
}

.brand-info li {
  margin-bottom: 1rem;
  font-size: 1rem;
  display: flex;
  align-items: center;
  font-weight: 500;
  transition: transform 0.3s ease;
}

.brand-info li:hover {
  transform: translateX(5px);
}

.brand-info li::before {
  content: '✓';
  color: #bbf7d0;
  font-weight: bold;
  margin-right: 0.75rem;
  font-size: 1.2rem;
}

/* Sección derecha */
.login-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 3rem 2rem;
  background: white;
}

.login-card {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: 380px;
  border: 1px solid #e5e7eb;
}

.login-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.login-header h2 {
  background: linear-gradient(135deg, #0D47A1 0%, #B71C1C 50%, #4527A0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 1.875rem;
  margin: 0 0 0.5rem 0;
  font-weight: 800;
  letter-spacing: -0.025em;
}

.login-header p {
  color: #4b5563;
  font-size: 1rem;
  margin: 0;
  font-weight: 500;
}

.form-group {
  margin-bottom: 1.75rem;
}

.form-group label {
  display: block;
  color: #1f2937;
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  letter-spacing: 0.025em;
  text-transform: uppercase;
}

.input-wrapper {
  position: relative;
}

.input-wrapper .icon {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 1.25rem;
  transition: color 0.3s ease;
}

.input-wrapper .icon-user,
.input-wrapper .icon-lock {
  left: 1rem;
}

.input-wrapper .icon-eye,
.input-wrapper .icon-eye-off {
  right: 1rem;
  cursor: pointer;
}

.input-wrapper .icon-eye::before {
  content: 'Ojo';
}

.input-wrapper .icon-eye-off::before {
  content: 'OjoCerrado';
}

.form-group input {
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border: 2px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background-color: white;
  font-weight: 500;
}

.form-group input:focus {
  outline: none;
  border-color: #0052CC;
  box-shadow: 0 0 0 4px rgba(0, 82, 204, 0.1);
}

.form-group input:focus + .icon,
.form-group input:focus ~ .icon {
  color: #0052CC;
}

.btn-submit {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #0D47A1 0%, #B71C1C 50%, #4527A0 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
}

.btn-submit:hover {
  background: linear-gradient(135deg, #0D47A1 0%, #4527A0 50%, #B71C1C 100%);
  transform: translateY(-3px);
  box-shadow: 0 15px 30px -5px rgba(13, 71, 161, 0.6);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.loading-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid white;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  background: #fef2f2;
  color: #AA0000;
  padding: 1rem 1.25rem;
  border-radius: 8px;
  margin-top: 1.5rem;
  border-left: 4px solid #AA0000;
  font-size: 0.875rem;
  line-height: 1.5;
}

.success-message {
  background: #f0fdf4;
  color: #15803d;
  padding: 1rem 1.25rem;
  border-radius: 8px;
  margin-top: 1.5rem;
  border-left: 4px solid #15803d;
  font-size: 0.875rem;
  line-height: 1.5;
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

/* Responsive */
@media (max-width: 768px) {
  .login-wrapper {
    flex-direction: column;
    min-height: auto;
    border-radius: 12px;
  }

  .login-left,
  .login-right {
    padding: 3rem 2rem;
  }

  .login-left {
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .brand-section h1 {
    font-size: 2rem;
  }

  .logo-icon {
    width: 56px;
    height: 60px;
  }

  .brand-info ul {
    text-align: center;
  }

  .brand-info li {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .login-card {
    padding: 2.5rem 2rem;
  }

  .login-left,
  .login-right {
    padding: 2.5rem 1.5rem;
  }

  .brand-section h1 {
    font-size: 1.75rem;
  }

  .login-header h2 {
    font-size: 1.625rem;
  }

  .btn-submit {
    padding: 0.875rem;
  }
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
  color: #0052CC;
  background: rgba(0, 82, 204, 0.05);
}

/* Modal Styles */
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
  color: #0052CC;
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0;
}

.close-btn {
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

.close-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.contact-info {
  text-align: center;
}

.contact-message {
  color: #4b5563;
  font-size: 1rem;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.developer-info {
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  border: 1px solid #e5e7eb;
}

.developer-info h4 {
  color: #0052CC;
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
}

.contact-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  transition: all 0.3s ease;
}

.contact-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 82, 204, 0.1);
  border-color: #0052CC;
}

.contact-item i {
  font-size: 1.25rem;
  color: #0052CC;
}

.contact-item .icon-mail::before {
  content: '📧';
}

.contact-item .icon-phone::before {
  content: '📱';
}

.contact-item span {
  color: #374151;
  font-weight: 500;
  font-size: 0.95rem;
}

.contact-note {
  color: #6b7280;
  font-size: 0.875rem;
  line-height: 1.5;
  font-style: italic;
}

/* Responsive modal */
@media (max-width: 480px) {
  .modal-content {
    margin: 1rem;
    padding: 1.5rem;
  }

  .contact-details {
    gap: 0.75rem;
  }

  .contact-item {
    padding: 0.625rem;
    gap: 0.625rem;
  }

  .contact-item span {
    font-size: 0.9rem;
  }
}

/* Responsive Layout */
@media (max-width: 768px) {
  .login-container {
    grid-template-columns: 1fr;
  }

  .login-left,
  .login-right {
    padding: 3rem 2rem;
  }

  .login-left {
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .brand-section h1 {
    font-size: 2rem;
  }

  .logo-icon {
    width: 120px;
    height: 80px;
  }

  .brand-info h3 {
    font-size: 1.3rem;
  }

  .brand-info ul {
    max-width: 280px;
  }

  .login-header h2 {
    font-size: 1.875rem;
  }
}

@media (max-width: 480px) {
  .login-container {
    min-height: auto;
  }

  .login-left,
  .login-right {
    padding: 1.5rem 1rem;
  }

  .brand-section h1 {
    font-size: 1.5rem;
  }

  .logo-icon {
    width: 100px;
    height: 60px;
  }

  .brand-subtitle {
    font-size: 0.9rem;
  }

  .brand-info h3 {
    font-size: 1.1rem;
  }

  .brand-info li {
    font-size: 0.9rem;
    margin-bottom: 0.75rem;
  }

  .login-card {
    padding: 1.5rem;
    max-width: 100%;
  }

  .login-header h2 {
    font-size: 1.5rem;
  }

  .form-group input {
    padding: 0.875rem 0.875rem 0.875rem 3rem;
    font-size: 0.875rem;
  }

  .input-wrapper .icon-user,
  .input-wrapper .icon-lock {
    left: 0.75rem;
  }

  .btn-submit {
    padding: 0.875rem;
    font-size: 0.875rem;
  }
}
</style>
