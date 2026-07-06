<template>
  <div class="logout-container">
    <button @click="handleLogout" class="btn-logout" :disabled="isLoading">
      <i class="icon icon-logout"></i>
      <span>{{ isLoading ? 'Cerrando sesión...' : 'Cerrar Sesión' }}</span>
    </button>
    
    <div v-if="showMenu" class="logout-menu" @click.stop>
      <button @click="handleLogout" class="menu-item">
        <i class="icon icon-logout"></i>
        Cerrar sesión
      </button>
      <button @click="handleLogoutAll" class="menu-item danger">
        <i class="icon icon-logout-all"></i>
        Cerrar sesión en todos los dispositivos
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isLoading = ref(false)
const showMenu = ref(false)

const handleLogout = async () => {
  isLoading.value = true
  console.log('Iniciando logout...')

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

      console.log('Sesión limpiada, redirigiendo a login...')
      // Redirigir a login
      router.push('/login')
    } else {
      const errorData = await response.json()
      console.error('Error en logout:', errorData)
    }
  } catch (error) {
    console.error('Error en logout:', error)
  } finally {
    isLoading.value = false
    showMenu.value = false
  }
}

const handleLogoutAll = async () => {
  if (!confirm('¿Cerrar sesión en TODOS los dispositivos? Se cerrará la sesión en otros navegadores también.')) {
    return
  }

  isLoading.value = true
  
  try {
    const accessToken = sessionStorage.getItem('accessToken')
    
    const response = await fetch('/api/logout-all', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      credentials: 'include'
    })

    if (response.ok) {
      // Limpiar sesión
      sessionStorage.removeItem('accessToken')
      sessionStorage.removeItem('authUser')
      
      // Redirigir a login
      router.push('/login')
    } else {
      console.error('Error en logout-all')
    }
  } catch (error) {
    console.error('Error en logout-all:', error)
  } finally {
    isLoading.value = false
    showMenu.value = false
  }
}
</script>

<style scoped>
.logout-container {
  position: relative;
}

.btn-logout {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  color: var(--color-primary-contrast);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.18s ease;
}

.btn-logout:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(25, 118, 210, 0.18);
}

.btn-logout:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.icon {
  width: 1rem;
  height: 1rem;
}

.logout-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  min-width: 200px;
  margin-top: 0.5rem;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  background: none;
  cursor: pointer;
  color: #374151;
  font-size: 0.875rem;
  text-align: left;
  transition: background-color 0.2s ease;
}

.menu-item:hover {
  background-color: #f3f4f6;
}

.menu-item.danger {
  color: #b31224; /* mantener rojo para acciones sensibles */
  border-top: 1px solid #e5e7eb;
}

.menu-item.danger:hover {
  background-color: #fef2f2;
}

@media (max-width: 768px) {
  .btn-logout {
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
  }
}
</style>
