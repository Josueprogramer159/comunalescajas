<template>
  <div class="dashboard">
    <!-- Header/Banner -->
    <header class="dashboard-header">
      <div class="header-content">
        <h1>Sistema de Gestión - Cajas Comunales</h1>
        <p>Panel de Administración - Bienvenido, {{ userData.name }}</p>
      </div>
      <div class="header-buttons">
        <button @click="abrirConfiguracion" class="btn-config" title="Configuración de Cuenta">
          <i class="lucide lucide-settings icon"></i>
          <span>🔧</span>
        </button>
        <button @click="handleLogout" class="btn-logout">
          <i class="lucide lucide-log-out icon"></i>
          Cerrar Sesión
        </button>
      </div>
    </header>

    <div class="dashboard-container">
      <!-- Sidebar -->
      <aside class="sidebar">
        <nav class="sidebar-nav">
          <h3 class="sidebar-title">Menú Principal</h3>
          <div
            v-for="group in menuGroups"
            :key="group.title"
            class="sidebar-section"
          >
            <h4 class="sidebar-section-title">{{ group.title }}</h4>
            <router-link
              v-for="item in group.items"
              :key="item.path"
              :to="item.path"
              class="nav-item"
              active-class="active"
            >
              <i :class="`lucide lucide-${item.icon} icon`"></i>
              <span class="label">{{ item.label }}</span>
            </router-link>
          </div>
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <div class="section-container">
          <router-view />
        </div>
      </main>
    </div>

    <!-- Modal de Configuración de Cuenta -->
    <div v-if="mostrarConfiguracion" class="modal-overlay" @click.self="cerrarConfiguracion">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Configuración de Cuenta</h2>
          <button class="btn-cerrar-modal" @click="cerrarConfiguracion">x</button>
        </div>
        <div class="modal-body">
          <div class="config-section">
            <h3>Opciones de Cuenta</h3>
            <button class="btn-config-item" @click="mostrarRestablecerCorreo = true">
              <i class="lucide lucide-mail icon"></i>
              Restablecer Correo
            </button>
            <div style="margin-top: 1rem;"></div>
            <button class="btn-config-item" @click="mostrarRestablecerContrasena = true">
              <i class="lucide lucide-lock icon"></i>
              Restablecer contraseña
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Restablecer Correo -->
    <div v-if="mostrarRestablecerCorreo" class="modal-overlay" @click.self="cerrarRestablecerCorreo">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Restablecer Correo</h2>
          <button class="btn-cerrar-modal" @click="cerrarRestablecerCorreo">x</button>
        </div>
        <div class="modal-body">
          <div class="info-section">
            <div class="info-item">
              <i class="lucide lucide-info info-icon"></i>
              <div>
                <strong>Correo actual en esta sesión:</strong>
                <div class="current-email">{{ userData.email }}</div>
                <small style="color: #6b7280; font-size: 0.85rem;">
                  Este es el correo que estás usando actualmente. 
                  Para cambiarlo permanentemente, se necesita implementar el backend.
                </small>
              </div>
            </div>
          </div>
          
          <form @submit.prevent="guardarNuevoCorreo" class="restablecer-form">
            <div class="form-group">
              <label for="correo-actual">Correo Actual</label>
              <div class="input-group">
                <i class="lucide lucide-mail input-icon"></i>
                <input
                  v-model="formularioCorreo.correoActual"
                  type="email"
                  id="correo-actual"
                  placeholder="Ingrese su correo actual"
                  required
                />
              </div>
            </div>

            <div class="form-group">
              <label for="nuevo-correo">Nuevo Correo</label>
              <div class="input-group">
                <i class="lucide lucide-mail input-icon"></i>
                <input
                  v-model="formularioCorreo.nuevoCorreo"
                  type="email"
                  id="nuevo-correo"
                  placeholder="Ingrese el nuevo correo"
                  required
                />
              </div>
            </div>

            <div class="form-group">
              <label for="confirmar-correo">Confirmar Nuevo Correo</label>
              <div class="input-group">
                <i class="lucide lucide-mail input-icon"></i>
                <input
                  v-model="formularioCorreo.confirmarCorreo"
                  type="email"
                  id="confirmar-correo"
                  placeholder="Confirme el nuevo correo"
                  required
                />
              </div>
            </div>

            <div v-if="errorCorreo" class="alert alert-error">
              <i class="lucide lucide-alert-circle alert-icon"></i>
              <div>{{ errorCorreo }}</div>
            </div>

            <div v-if="exitoCorreo" class="alert alert-success">
              <i class="lucide lucide-check-circle alert-icon"></i>
              <div>
                <strong>{{ exitoCorreo }}</strong>
                <br>
                <small style="opacity: 0.8;">
                  El correo ha sido actualizado en la base de datos.
                  <br>
                  Correo actual en sesión: <strong>{{ userData.email }}</strong>
                </small>
              </div>
            </div>

            <div class="form-actions">
              <button type="button" @click="cerrarRestablecerCorreo" class="btn-cancelar">
                Cancelar
              </button>
              <button type="submit" class="btn-aceptar" :disabled="cargandoCorreo">
                <span v-if="cargandoCorreo" class="spinner"></span>
                {{ cargandoCorreo ? 'Guardando...' : 'Aceptar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal de Restablecer Contraseña -->
    <div v-if="mostrarRestablecerContrasena" class="modal-overlay" @click.self="cerrarRestablecerContrasena">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Restablecer Contraseña</h2>
          <button class="btn-cerrar-modal" @click="cerrarRestablecerContrasena">x</button>
        </div>
        <div class="modal-body">
          <div class="info-section">
            <div class="info-item">
              <i class="lucide lucide-shield-check info-icon"></i>
              <div>
                <strong>Seguridad de cuenta</strong>
                <small style="color: #6b7280; font-size: 0.85rem;">
                  Ingresa tu contraseña actual y establece una nueva contraseña segura.
                </small>
              </div>
            </div>
          </div>
          
          <form @submit.prevent="guardarNuevaContrasena" class="restablecer-form">
            <div class="form-group">
              <label for="contrasena-actual">Contraseña Actual</label>
              <div class="input-group">
                <i class="lucide lucide-lock input-icon"></i>
                <input
                  v-model="formularioContrasena.contrasenaActual"
                  :type="mostrarContrasenaActual ? 'text' : 'password'"
                  id="contrasena-actual"
                  placeholder="Ingrese su contraseña actual"
                  required
                />
                <button type="button" @click="mostrarContrasenaActual = !mostrarContrasenaActual" class="btn-ver-contrasena">
                  <i :class="mostrarContrasenaActual ? 'lucide lucide-eye-off' : 'lucide lucide-eye'"></i>
                </button>
              </div>
            </div>

            <div class="form-group">
              <label for="nueva-contrasena">Nueva Contraseña</label>
              <div class="input-group">
                <i class="lucide lucide-lock input-icon"></i>
                <input
                  v-model="formularioContrasena.nuevaContrasena"
                  :type="mostrarNuevaContrasena ? 'text' : 'password'"
                  id="nueva-contrasena"
                  placeholder="Ingrese la nueva contraseña"
                  required
                  minlength="6"
                />
                <button type="button" @click="mostrarNuevaContrasena = !mostrarNuevaContrasena" class="btn-ver-contrasena">
                  <i :class="mostrarNuevaContrasena ? 'lucide lucide-eye-off' : 'lucide lucide-eye'"></i>
                </button>
              </div>
            </div>

            <div class="form-group">
              <label for="confirmar-contrasena">Confirmar Nueva Contraseña</label>
              <div class="input-group">
                <i class="lucide lucide-lock input-icon"></i>
                <input
                  v-model="formularioContrasena.confirmarContrasena"
                  :type="mostrarConfirmarContrasena ? 'text' : 'password'"
                  id="confirmar-contrasena"
                  placeholder="Confirme la nueva contraseña"
                  required
                  minlength="6"
                />
                <button type="button" @click="mostrarConfirmarContrasena = !mostrarConfirmarContrasena" class="btn-ver-contrasena">
                  <i :class="mostrarConfirmarContrasena ? 'lucide lucide-eye-off' : 'lucide lucide-eye'"></i>
                </button>
              </div>
            </div>

            <div v-if="errorContrasena" class="alert alert-error">
              <i class="lucide lucide-alert-circle alert-icon"></i>
              <div>{{ errorContrasena }}</div>
            </div>

            <div v-if="exitoContrasena" class="alert alert-success">
              <i class="lucide lucide-check-circle alert-icon"></i>
              <div>
                <strong>{{ exitoContrasena }}</strong>
                <br>
                <small style="opacity: 0.8;">
                  La contraseña ha sido actualizada en la base de datos.
                  Usa la nueva contraseña para tu próximo inicio de sesión.
                </small>
              </div>
            </div>

            <div class="form-actions">
              <button type="button" @click="cerrarRestablecerContrasena" class="btn-cancelar">
                Cancelar
              </button>
              <button type="submit" class="btn-aceptar" :disabled="cargandoContrasena">
                <span v-if="cargandoContrasena" class="spinner"></span>
                {{ cargandoContrasena ? 'Guardando...' : 'Aceptar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    <div v-if="showConfirmModal" class="confirm-modal-overlay" @click.self="closeConfirmModal">
      <div class="confirm-modal-content">
        <div class="confirm-modal-header">
          <h4>Confirmar Cierre de Sesión</h4>
          <button class="btn-close-modal" @click="closeConfirmModal">×</button>
        </div>
        <div class="confirm-modal-body">
          <div class="confirm-icon">
            <i class="lucide lucide-log-out"></i>
          </div>
          <p>{{ confirmMessage }}</p>
        </div>
        <div class="confirm-modal-actions">
          <button @click="closeConfirmModal" class="btn-cancel-confirm">
            Cancelar
          </button>
          <button @click="handleConfirm" class="btn-confirm-action">
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const userData = ref({ name: '', email: '' })

// Estado para el modal de confirmación
const showConfirmModal = ref(false)
const confirmAction = ref(null)
const confirmMessage = ref('')

// Función para mostrar confirmación personalizada
function showCustomConfirm(message, onConfirm) {
  console.log(' Mostrando confirmación:', message)
  confirmMessage.value = message
  confirmAction.value = onConfirm
  showConfirmModal.value = true
  console.log(' Estado del modal:', showConfirmModal.value)
}

// Función para confirmar acción
function handleConfirm() {
  console.log(' Confirmado, ejecutando acción')
  if (confirmAction.value) {
    confirmAction.value()
  }
  closeConfirmModal()
}

// Función para cancelar
function closeConfirmModal() {
  console.log(' Cerrando modal')
  showConfirmModal.value = false
  confirmAction.value = null
  confirmMessage.value = ''
}

const mostrarConfiguracion = ref(false)
const mostrarRestablecerCorreo = ref(false)
const mostrarRestablecerContrasena = ref(false)
const cargandoCorreo = ref(false)
const cargandoContrasena = ref(false)
const errorCorreo = ref('')
const exitoCorreo = ref('')
const errorContrasena = ref('')
const exitoContrasena = ref('')

// Estados para mostrar/ocultar contraseñas
const mostrarContrasenaActual = ref(false)
const mostrarNuevaContrasena = ref(false)
const mostrarConfirmarContrasena = ref(false)

const formularioCorreo = ref({
  correoActual: '',
  nuevoCorreo: '',
  confirmarCorreo: ''
})

const formularioContrasena = ref({
  contrasenaActual: '',
  nuevaContrasena: '',
  confirmarContrasena: ''
})

const menuGroups = ref([
  {
    title: 'Gestión de Socios',
    items: [
      { icon: 'users', label: 'Listados de Socios', path: '/dashboard/listados-socios' },
      { icon: 'shield', label: 'Cuerpo Directivo', path: '/dashboard/cuerpo-directivo' },
      { icon: 'file-text', label: 'Cuerpo Normativo', path: '/dashboard/cuerpo-normativo' },
    ]
  },
  {
    title: 'Cálculos y Resultados',
    items: [
      { icon: 'scale', label: 'Balance General', path: '/dashboard/balance-general' },
    ]
  },
  {
    title: 'Movimiento Financiero',
    items: [
      { icon: 'dollar-sign', label: 'Registro de Aportes', path: '/dashboard/registro-aportes' },
      { icon: 'book-open', label: 'Registro de prestamos', path: '/dashboard/libretas' },
      { icon: 'clipboard-list', label: 'Resumen de intereses', path: '/dashboard/registro-contable' },
      { icon: 'wallet', label: 'Caja Chica', path: '/dashboard/caja-chica' },
      { icon: 'calculator', label: 'Simulador de creditos', path: '/dashboard/simulador-creditos' },
    ]
  },
  {
    title: 'Backups',
    items: [
      { icon: 'database', label: 'Copias de seguridad', path: '/dashboard/backups' },
    ]
  },

])

onMounted(() => {
  const authUser = sessionStorage.getItem('authUser')
  if (authUser) {
    userData.value = JSON.parse(authUser)
  }
})

const handleLogout = async () => {
  showCustomConfirm(
    '¿Está seguro de que desea cerrar sesión?',
    async () => {
      console.log('Iniciando logout desde dashboard...')

      try {
        const accessToken = sessionStorage.getItem('accessToken')
        console.log('Access token:', accessToken ? 'presente' : 'no encontrado')

        const response = await fetch('/api/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          credentials: 'include' // Enviar cookies
        })

        console.log('Respuesta del servidor:', response.status, response.ok)

        if (response.ok) {
          console.log('Logout exitoso, limpiando sesión...')
          // Limpiar sesión
          sessionStorage.removeItem('accessToken')
          sessionStorage.removeItem('authUser')
          localStorage.removeItem('authUser')

          console.log('Sesión limpiada, redirigiendo a login...')
          // Redirigir a login
          window.location.href = '/login'
        } else {
          console.error('Error en logout:', response.status)
        }
      } catch (error) {
        console.error('Error en logout:', error)
        // En caso de error, limpiar sesión localmente y redirigir
        sessionStorage.removeItem('accessToken')
        sessionStorage.removeItem('authUser')
        localStorage.removeItem('authUser')
        window.location.href = '/login'
      }
    }
  )
}

const abrirConfiguracion = () => {
  mostrarConfiguracion.value = true
}

const cerrarConfiguracion = () => {
  mostrarConfiguracion.value = false
}

const restablecerCorreo = () => {
  mostrarRestablecerCorreo.value = true
}

const cerrarRestablecerCorreo = () => {
  mostrarRestablecerCorreo.value = false
  errorCorreo.value = ''
  exitoCorreo.value = ''
  formularioCorreo.value = {
    correoActual: '',
    nuevoCorreo: '',
    confirmarCorreo: ''
  }
}

const guardarNuevoCorreo = async () => {
  errorCorreo.value = ''
  exitoCorreo.value = ''

  // Validar que los correos nuevos coincidan
  if (formularioCorreo.value.nuevoCorreo !== formularioCorreo.value.confirmarCorreo) {
    errorCorreo.value = 'Los correos nuevos no coinciden'
    return
  }

  // Validar que el correo actual coincida con el del usuario
  if (formularioCorreo.value.correoActual !== userData.value.email) {
    errorCorreo.value = 'El correo actual no coincide con el de la sesión'
    return
  }

  cargandoCorreo.value = true

  // Llamada real al backend
  try {
    const accessToken = sessionStorage.getItem('accessToken')
    
    const response = await fetch('/api/actualizar-correo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        correoActual: formularioCorreo.value.correoActual,
        nuevoCorreo: formularioCorreo.value.nuevoCorreo
      })
    })

    const data = await response.json()

    if (!response.ok) {
      errorCorreo.value = data.message || 'Error al actualizar el correo'
      return
    }

    if (data.success) {
      // Actualizar el correo en los datos del usuario
      userData.value.email = formularioCorreo.value.nuevoCorreo
      
      // Actualizar sessionStorage
      sessionStorage.setItem('authUser', JSON.stringify({
        id: userData.value.id,
        name: userData.value.name,
        email: formularioCorreo.value.nuevoCorreo
      }))

      exitoCorreo.value = 'Correo actualizado exitosamente'
      
      // Cerrar el modal después de 2 segundos
      setTimeout(() => {
        cerrarRestablecerCorreo()
        cerrarConfiguracion()
      }, 2000)
    } else {
      errorCorreo.value = data.message || 'Error al actualizar el correo'
    }
  } catch (error) {
    console.error('Error en la petición:', error)
    errorCorreo.value = 'Error de conexión. Intente nuevamente.'
  } finally {
    cargandoCorreo.value = false
  }
}

const restablecerContrasena = () => {
  mostrarRestablecerContrasena.value = true
}

const cerrarRestablecerContrasena = () => {
  mostrarRestablecerContrasena.value = false
  errorContrasena.value = ''
  exitoContrasena.value = ''
  formularioContrasena.value = {
    contrasenaActual: '',
    nuevaContrasena: '',
    confirmarContrasena: ''
  }
  // Resetear estados de visibilidad
  mostrarContrasenaActual.value = false
  mostrarNuevaContrasena.value = false
  mostrarConfirmarContrasena.value = false
}

const guardarNuevaContrasena = async () => {
  errorContrasena.value = ''
  exitoContrasena.value = ''

  // Validar que las nuevas contraseñas coincidan
  if (formularioContrasena.value.nuevaContrasena !== formularioContrasena.value.confirmarContrasena) {
    errorContrasena.value = 'Las nuevas contraseñas no coinciden'
    return
  }

  // Validar longitud mínima
  if (formularioContrasena.value.nuevaContrasena.length < 6) {
    errorContrasena.value = 'La nueva contraseña debe tener al menos 6 caracteres'
    return
  }

  cargandoContrasena.value = true

  // Llamada real al backend
  try {
    const accessToken = sessionStorage.getItem('accessToken')
    
    const response = await fetch('/api/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        email: userData.value.email,
        currentPassword: formularioContrasena.value.contrasenaActual,
        newPassword: formularioContrasena.value.nuevaContrasena
      })
    })

    const data = await response.json()

    if (!response.ok) {
      errorContrasena.value = data.message || 'Error al actualizar la contraseña'
      return
    }

    if (data.success) {
      exitoContrasena.value = 'Contraseña actualizada exitosamente'
      
      // Cerrar el modal después de 2 segundos
      setTimeout(() => {
        cerrarRestablecerContrasena()
        cerrarConfiguracion()
      }, 2000)
    } else {
      errorContrasena.value = data.message || 'Error al actualizar la contraseña'
    }
  } catch (error) {
    console.error('Error en la petición:', error)
    errorContrasena.value = 'Error de conexión. Intente nuevamente.'
  } finally {
    cargandoContrasena.value = false
  }
}
</script>

<style scoped>
@import url('https://cdn.jsdelivr.net/npm/lucide@latest/dist/umd/lucide.css');

a {
  text-decoration: none;
}

.dashboard {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(
    135deg,
    #0b3c8c,
    #1e6fbf,
    #7a3b6c,
    #c21d2c
  );
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.dashboard-header {
  background: linear-gradient(
    135deg,
    #0b3c8c,
    #1e6fbf,
    #7a3b6c,
    #c21d2c
  );
  color: white;
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 20px rgba(11, 60, 140, 0.4);
  position: sticky;
  top: 0;
  z-index: 1000;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.header-buttons {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.btn-config {
  padding: 0.8rem;
  background: transparent;
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  font-size: 1.2rem;
  width: 48px;
  height: 48px;
}

.btn-config:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.8);
  transform: translateY(-1px) rotate(20deg);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-logout {
  padding: 0.8rem 1.5rem;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-logout:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.dashboard-container {
  display: flex;
  flex: 1;
}

.sidebar {
  width: 280px;
  background: white;
  padding: 1.5rem;
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.1);
  border-right: 1px solid #e2e8f0;
  height: 100%;
  overflow-y: auto;
}

.sidebar-title {
  background: linear-gradient(
    135deg,
    #0b3c8c,
    #1e6fbf,
    #7a3b6c,
    #c21d2c
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
  text-transform: uppercase;
  font-weight: 700;
}

.sidebar-section-title {
  color: #2c5282;
  font-size: 0.85rem;
  margin-bottom: 0.8rem;
  text-transform: uppercase;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.8rem 1rem;
  color: #4a5568;
  border-radius: 8px;
  background: linear-gradient(
    135deg,
    rgba(11, 60, 140, 0.05),
    rgba(30, 111, 191, 0.05),
    rgba(122, 59, 108, 0.05),
    rgba(194, 29, 44, 0.05)
  );
  transition: all 0.3s ease;
}

.nav-item:hover {
  background: linear-gradient(
    135deg,
    #0b3c8c,
    #1e6fbf,
    #7a3b6c,
    #c21d2c
  );
  color: white;
}

.nav-item.active {
  background: linear-gradient(
    135deg,
    #0b3c8c,
    #1e6fbf,
    #7a3b6c,
    #c21d2c
  );
  color: white;
}

.icon {
  color: inherit;
}

.main-content {
  flex: 1;
  padding: 2rem;
}

.section-container {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

/* ===== MODAL DE CONFIGURACIÓN ===== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  width: 90%;
  animation: slideUp 0.3s ease;
  overflow: hidden;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  background: linear-gradient(135deg, #0b3c8c, #1e6fbf);
  color: white;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.btn-cerrar-modal {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.btn-cerrar-modal:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

.modal-body {
  padding: 2rem;
}

.config-section {
  margin-bottom: 2rem;
}

.config-section h3 {
  margin: 0 0 1rem 0;
  color: #0b3c8c;
  font-size: 1.1rem;
  font-weight: 600;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 0.75rem;
}

.btn-config-item {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #0b3c8c, #1e6fbf);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  justify-content: flex-start;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(11, 60, 140, 0.2);
}

.btn-config-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(11, 60, 140, 0.3);
  background: linear-gradient(135deg, #0a3070, #1a5fa0);
}

.btn-config-item .icon {
  width: 20px;
  height: 20px;
}

/* ===== MODAL DE RESTABLECER CORREO ===== */
.info-section {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 8px;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.info-icon {
  color: #0284c7;
  margin-top: 0.125rem;
  flex-shrink: 0;
}

.current-email {
  font-family: 'Courier New', monospace;
  background: white;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
  margin: 0.5rem 0;
  color: #1f2937;
  font-weight: 600;
}

.restablecer-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #374151;
  font-size: 0.9rem;
}

.input-group {
  position: relative;
  display: flex;
  align-items: center;
}

.btn-ver-contrasena {
  position: absolute;
  right: 1rem;
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.3s ease;
  z-index: 2;
}

.btn-ver-contrasena:hover {
  color: #0b3c8c;
  background: rgba(11, 60, 140, 0.05);
}

.restablecer-form input {
  width: 100%;
  padding: 0.875rem 3rem 0.875rem 3rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  background: #f9fafb;
}

.restablecer-form input:focus {
  outline: none;
  background: white;
  border-color: #0b3c8c;
  box-shadow: 0 0 0 3px rgba(11, 60, 140, 0.1);
}

.restablecer-form input::placeholder {
  color: #9ca3af;
}

.alert {
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
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

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
}

.btn-cancelar {
  padding: 0.75rem 1.5rem;
  background: white;
  color: #6b7280;
  border: 2px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancelar:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.btn-aceptar {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #0b3c8c, #1e6fbf);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-aceptar:hover:not(:disabled) {
  background: linear-gradient(135deg, #0a3070, #1a5fa0);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(11, 60, 140, 0.3);
}

.btn-aceptar:disabled {
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

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Modal de Confirmación Mejorado */
.confirm-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.confirm-modal-content {
  background: white;
  border-radius: 16px;
  width: 450px;
  max-width: 90vw;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
  animation: confirmModalSlideIn 0.3s ease-out;
  overflow: hidden;
  position: relative;
  z-index: 10000;
}

@keyframes confirmModalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.confirm-modal-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e9ecef;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.confirm-modal-header h4 {
  margin: 0;
  color: #495057;
  font-size: 1.2rem;
  font-weight: 600;
}

.btn-close-modal {
  background: rgba(0, 0, 0, 0.1);
  color: #6c757d;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.btn-close-modal:hover {
  background: rgba(220, 53, 69, 0.1);
  color: #dc3545;
  transform: rotate(90deg);
}

.confirm-modal-body {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.confirm-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #dc3545, #c82333);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  animation: confirmIconPulse 0.6s ease-out;
}

@keyframes confirmIconPulse {
  0% {
    box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.4);
  }
  50% {
    box-shadow: 0 0 0 20px rgba(220, 53, 69, 0.2);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.4);
  }
}

.confirm-modal-body p {
  margin: 0;
  color: #495057;
  font-size: 1.1rem;
  text-align: center;
  line-height: 1.5;
  font-weight: 500;
}

.confirm-modal-actions {
  padding: 1.5rem 2rem;
  border-top: 1px solid #e9ecef;
  background: #f8f9fa;
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn-cancel-confirm {
  padding: 0.75rem 1.5rem;
  border: 2px solid #6c757d;
  background: white;
  color: #6c757d;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
}

.btn-cancel-confirm:hover {
  background: #6c757d;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
}

.btn-confirm-action {
  padding: 0.75rem 1.5rem;
  border: none;
  background: linear-gradient(135deg, #dc3545, #c82333);
  color: white;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 140px;
}

.btn-confirm-action:hover {
  background: linear-gradient(135deg, #c82333, #bd2130);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(220, 53, 69, 0.4);
}
</style>
