<template>
  <div class="movimiento-container">
    <!-- HEADER -->
    <div class="header-section">
      <div class="header-content">
        <div class="header-icon">
          <i class="fas fa-exchange-alt"></i>
        </div>
        <div class="header-text">
          <h1>Movimiento Individual</h1>
          <p class="subtitle">Consulta detallada de movimientos financieros por socio</p>
        </div>
      </div>
      <div v-if="movimientoSocio" class="header-stats">
        <div class="stat-card">
          <div class="stat-icon"><i class="fas fa-piggy-bank"></i></div>
          <div class="stat-info">
            <span class="stat-label">Saldo en Ahorros</span>
            <span class="stat-value">${{ format(movimientoSocio.saldo_ahorros) }}</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon"><i class="fas fa-hand-holding-usd"></i></div>
          <div class="stat-info">
            <span class="stat-label">Préstamos Activos</span>
            <span class="stat-value">${{ format(movimientoSocio.total_prestamos) }}</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon"><i class="fas fa-balance-scale"></i></div>
          <div class="stat-info">
            <span class="stat-label">Balance Neto</span>
            <span class="stat-value" :class="movimientoSocio.balance_neto >= 0 ? 'positivo' : 'negativo'">
              ${{ format(movimientoSocio.balance_neto) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- NOTIFICATION -->
    <div v-if="notification.show" class="notification" :class="notification.type">
      <div class="notification-content">
        <span class="notification-icon">{{ notification.icon }}</span>
        <span class="notification-message">{{ notification.message }}</span>
      </div>
      <button @click="notification.show = false" class="notification-close">
        <i class="fas fa-times"></i>
      </button>
    </div>

    <!-- SELECTOR DE SOCIO -->
    <div class="selector-section">
      <div class="selector-card">
        <h3><i class="fas fa-search"></i> Buscar Socio</h3>
        <div class="input-group">
          <label for="socio-select">Seleccionar Socio:</label>
          <select 
            id="socio-select" 
            v-model="socioSeleccionado" 
            class="socio-select"
          >
            <option value="">-- Seleccione un socio --</option>
            <option 
              v-for="socio in listaSocios" 
              :key="socio.id" 
              :value="socio.id"
            >
              {{ socio.nombre_completo || socio.nombre || 'Sin nombre' }} (N° {{ socio.numero_socio }})
            </option>
          </select>
          <button 
            @click="cargarMovimientoSocio" 
            :disabled="!socioSeleccionado || loadingMovimiento"
            class="btn-buscar"
          >
            <i :class="loadingMovimiento ? 'fas fa-spinner fa-spin' : 'fas fa-search'"></i>
            <span>{{ loadingMovimiento ? 'Cargando...' : 'Consultar' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- RESUMEN INDIVIDUAL DE SOCIOS -->
    <div class="resumen-socios-section">
      <div class="resumen-socios-card">
        <div class="resumen-socios-header">
          <h3><i class="fas fa-users"></i> Totales por Socio</h3>
          <span class="resumen-socios-subtitle">Cada fila muestra un total individual por socio.</span>
        </div>
        <div class="tabla-container resumen-socios-table-container">
          <table class="tabla-resumen-socios">
            <thead>
              <tr>
                <th>N° Socio</th>
                <th>Nombre</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="registro in totalesPorSocio"
                :key="registro.id"
                class="tabla-fila tabla-fila-socio"
                @click="seleccionarSocio(registro.id)"
              >
                <td>{{ registro.numero_socio }}</td>
                <td>{{ registro.nombre }}</td>
                <td>${{ format(registro.total) }}</td>
              </tr>
            </tbody>
          </table>
          <p v-if="!listaSocios.length" class="sin-datos-texto">No hay socios registrados para mostrar.</p>
        </div>
      </div>
    </div>

    <!-- INFORMACIÓN DEL SOCIO -->
    <div v-if="movimientoSocio" class="socio-section">
      <!-- INFO BÁSICA -->
      <div class="socio-info-card">
        <div class="socio-avatar">
          <i class="fas fa-user"></i>
        </div>
        <div class="socio-datos">
          <h2>{{ movimientoSocio.nombre }}</h2>
          <p class="socio-numero">Socio N° {{ movimientoSocio.numero_socio }}</p>
        </div>
      </div>

      <!-- RESUMEN FINANCIERO -->
      <div class="resumen-grid">
        <div class="resumen-card ahorros">
          <div class="resumen-header">
            <i class="fas fa-piggy-bank"></i>
            <h4>Ahorros Acumulados</h4>
          </div>
          <div class="resumen-body">
            <span class="resumen-monto">${{ format(movimientoSocio.saldo_ahorros) }}</span>
            <span class="resumen-label">Saldo Total</span>
          </div>
        </div>
        <div class="resumen-card prestamos">
          <div class="resumen-header">
            <i class="fas fa-hand-holding-usd"></i>
            <h4>Préstamos Vigentes</h4>
          </div>
          <div class="resumen-body">
            <span class="resumen-monto">${{ format(movimientoSocio.total_prestamos) }}</span>
            <span class="resumen-label">Capital Prestado</span>
          </div>
        </div>

        <div class="resumen-card balance">
          <div class="resumen-header">
            <i class="fas fa-balance-scale"></i>
            <h4>Balance Neto</h4>
          </div>
          <div class="resumen-body">
            <span class="resumen-monto" :class="movimientoSocio.balance_neto >= 0 ? 'positivo' : 'negativo'">
              ${{ format(movimientoSocio.balance_neto) }}
            </span>
            <span class="resumen-label">Ahorros - Préstamos</span>
          </div>
        </div>
      </div>

      <!-- HISTORIAL DE MOVIMIENTOS -->
      <div class="historial-section">
        <div class="historial-header">
          <h3><i class="fas fa-history"></i> Historial de Movimientos</h3>
          <div class="historial-stats">
            <span class="badge">{{ movimientoSocio.movimientos?.length || 0 }} registros</span>
          </div>
        </div>

        <div v-if="movimientoSocio.movimientos && movimientoSocio.movimientos.length > 0" class="tabla-container">
          <table class="tabla-movimientos">
            <thead>
              <tr>
                <th><i class="fas fa-calendar"></i> Fecha</th>
                <th><i class="fas fa-tag"></i> Tipo</th>
                <th><i class="fas fa-file-text"></i> Concepto</th>
                <th><i class="fas fa-dollar-sign"></i> Monto</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="mov in movimientoSocio.movimientos" 
                :key="mov.id"
                class="tabla-fila"
              >
                <td>{{ formatFecha(mov.fecha) }}</td>
                <td>
                  <span class="tipo-badge" :class="mov.tipo">
                    {{ mov.tipo_label }}
                  </span>
                </td>
                <td>{{ mov.concepto }}</td>
                <td>
                  <span class="monto" :class="mov.tipo === 'ingreso' ? 'positivo' : 'negativo'">
                    {{ mov.tipo === 'ingreso' ? '+' : '-' }}${{ format(Math.abs(mov.monto)) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="sin-movimientos">
          <div class="sin-movimientos-content">
            <i class="fas fa-info-circle"></i>
            <h4>No hay movimientos registrados</h4>
            <p>Este socio aún no tiene movimientos en su historial</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ESTADO SIN SOCIO SELECCIONADO -->
    <div v-else-if="!socioSeleccionado" class="estado-inicial">
      <div class="estado-content">
        <i class="fas fa-users"></i>
        <h3>Seleccione un Socio</h3>
        <p>Escoja un socio del listado para consultar su movimiento financiero individual</p>
        <div class="stats-generales">
          <div class="stat-item">
            <span class="stat-number">{{ listaSocios.length }}</span>
            <span class="stat-text">Socios Registrados</span>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'

const loading = ref(false)
const loadingMovimiento = ref(false)

const notification = ref({ show: false, type: 'success', icon: '', message: '' })

const showNotification = (type, icon, message) => {
  notification.value = { show: true, type, icon, message }
  setTimeout(() => (notification.value.show = false), 4000)
}

// Datos para Movimiento Individual
const listaSocios = ref([])
const socioSeleccionado = ref('')
const movimientoSocio = ref(null)
const registrosAportes = ref([])
const registrosPrestamos = ref([])
const totalesPorSocio = ref([])

// ===== FUNCIONES =====
const cargarSocios = async () => {
  console.log('🔍 Cargando lista de socios...')
  try {
    const response = await fetch('/api/socios')
    const data = await response.json()
    console.log('📋 Respuesta de socios:', data)
    if (data.success) {
      listaSocios.value = data.data.sort((a, b) => a.numero_socio - b.numero_socio)
      calcularTotalesPorSocio()
      console.log('✅ Socios cargados:', listaSocios.value.length)
    }
  } catch (error) {
    console.error('❌ Error cargando socios:', error)
    showNotification('error', '❌', 'Error al cargar lista de socios')
  }
}

const cargarRegistrosDeSocios = async () => {
  try {
    const [aportesRes, prestamosRes] = await Promise.all([
      fetch('/api/registro-aportes'),
      fetch('/api/registro-prestamos')
    ])

    const aportesData = await aportesRes.json()
    const prestamosData = await prestamosRes.json()

    registrosAportes.value = aportesData.success ? aportesData.data : []
    registrosPrestamos.value = prestamosData.success ? prestamosData.data : []
    calcularTotalesPorSocio()
  } catch (error) {
    console.error('❌ Error cargando registros de socios:', error)
  }
}

const calcularTotalesPorSocio = () => {
  const latestAhorrosPorSocio = {}

  registrosAportes.value.forEach((registro) => {
    const socioId = registro.socio_id
    const fechaRegistro = registro.fecha_registro ? new Date(registro.fecha_registro) : new Date()
    const current = latestAhorrosPorSocio[socioId]

    if (!current || fechaRegistro > current.fecha) {
      latestAhorrosPorSocio[socioId] = {
        saldoAhorros: Number(registro.saldo_ahorros || 0),
        fecha: fechaRegistro
      }
    }
  })

  const prestamosPorNombre = {}
  registrosPrestamos.value.forEach((registro) => {
    const nombreSocio = (registro.socio || '').trim()
    const saldoPrestamo = Number(registro.saldo || 0)
    prestamosPorNombre[nombreSocio] = (prestamosPorNombre[nombreSocio] || 0) + saldoPrestamo
  })

  totalesPorSocio.value = listaSocios.value.map((socio) => {
    const nombreSocio = (socio.nombre_completo || socio.nombre || '').trim()
    const saldoAhorros = latestAhorrosPorSocio[socio.id]?.saldoAhorros || 0
    const saldoPrestamos = prestamosPorNombre[nombreSocio] || 0
    const total = saldoAhorros - saldoPrestamos

    return {
      id: socio.id,
      numero_socio: socio.numero_socio,
      nombre: nombreSocio || 'Sin nombre',
      saldoAhorros,
      saldoPrestamos,
      total
    }
  })
}

const seleccionarSocio = async (id) => {
  socioSeleccionado.value = id
  await cargarMovimientoSocio()
}

const cargarMovimientoSocio = async () => {
  console.log('🔍 Cargando movimiento del socio:', socioSeleccionado.value)
  if (!socioSeleccionado.value) {
    showNotification('warning', '⚠️', 'Por favor seleccione un socio')
    return
  }
  
  loadingMovimiento.value = true
  try {
    console.log('📡 Haciendo petición a:', `/api/movimiento-socio/${socioSeleccionado.value}`)
    
    const response = await fetch(`/api/movimiento-socio/${socioSeleccionado.value}`)
    console.log('📊 Status de respuesta:', response.status, response.statusText)
    
    const data = await response.json()
    console.log('📊 Respuesta completa:', data)
    
    if (data.success) {
      movimientoSocio.value = data.data
      console.log('✅ Movimiento cargado:', movimientoSocio.value)
      showNotification('success', '✅', 'Movimiento individual cargado correctamente')
    } else {
      console.error('❌ Error en respuesta:', data.message)
      showNotification('error', '❌', `Error: ${data.message || 'Error desconocido'}`)
    }
  } catch (error) {
    console.error('❌ Error cargando movimiento del socio:', error)
    showNotification('error', '❌', `Error de conexión: ${error.message}`)
  } finally {
    loadingMovimiento.value = false
  }
}

const formatFecha = (fecha) => {
  if (!fecha) return '-'
  return new Date(fecha).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric'
  })
}

const format = (n) =>
  new Intl.NumberFormat('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0)

onMounted(() => {
  console.log('🚀 Componente MovimientoIndividual montado')
  cargarSocios()
  cargarRegistrosDeSocios()
})
</script>
<style scoped>
.movimiento-container {
  background-color: #f5f7fa;
  min-height: 100vh;
  padding: 2rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* HEADER */
.header-section {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 20px rgba(33,150,243,0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 2rem;
}

.header-content { display: flex; align-items: center; gap: 1.5rem; }

.header-icon {
  background: linear-gradient(135deg, #1565c0, #2196f3);
  color: white; width: 70px; height: 70px; border-radius: 20px;
  display: flex; align-items: center; justify-content: center; font-size: 2rem;
  box-shadow: 0 4px 16px rgba(33,150,243,0.3);
}

.header-text h1 { margin: 0; color: #1565c0; font-size: 2.2rem; font-weight: 700; }
.subtitle { margin: 0.5rem 0 0; color: #546e7a; font-size: 1.1rem; }

.header-stats { display: flex; gap: 1.5rem; flex-wrap: wrap; }
.stat-card {
  background: white; padding: 1.3rem 1.6rem; border-radius: 16px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.08); min-width: 180px; text-align: center;
  transition: transform 0.3s; border-top: 4px solid #2196f3;
}
.stat-card:hover { transform: translateY(-4px); }
.stat-icon { font-size: 2rem; color: #2196f3; margin-bottom: 0.5rem; }
.stat-label { display: block; color: #7f8c8d; font-size: 0.9rem; font-weight: 600; margin-bottom: 0.4rem; }
.stat-value { display: block; color: #2c3e50; font-size: 1.4rem; font-weight: 800; }
.positivo { color: #2e7d32 !important; }
.negativo { color: #c62828 !important; }

/* NOTIFICATION */
.notification {
  position: fixed; top: 20px; right: 20px; background: white;
  border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  z-index: 1000; min-width: 350px; animation: slideInRight 0.3s ease;
}
.notification.success { border-left: 4px solid #27ae60; }
.notification.error { border-left: 4px solid #e74c3c; }
.notification.warning { border-left: 4px solid #f39c12; }
.notification-content { display: flex; align-items: center; gap: 1rem; padding: 1rem 1.5rem; }
.notification-icon { font-size: 1.4rem; }
.notification-message { flex: 1; font-weight: 500; color: #2c3e50; }
.notification-close { background: none; border: none; color: #7f8c8d; font-size: 1.2rem; cursor: pointer; padding: 0.5rem; }

/* SELECTOR DE SOCIO */
.selector-section { margin-bottom: 2rem; }
.selector-card {
  background: white; border-radius: 16px; padding: 2rem;
  box-shadow: 0 6px 20px rgba(0,0,0,0.08); border-top: 4px solid #2196f3;
}
.selector-card h3 {
  margin: 0 0 1.5rem; color: #1565c0; font-size: 1.4rem; font-weight: 700;
  display: flex; align-items: center; gap: 0.6rem;
}
.input-group { display: flex; align-items: end; gap: 1.2rem; flex-wrap: wrap; }
.input-group label {
  display: block; margin-bottom: 0.6rem; color: #455a64; font-weight: 600; font-size: 1rem;
}
.socio-select {
  flex: 1; min-width: 250px; padding: 1rem 1.2rem; border: 2px solid #e0e0e0;
  border-radius: 10px; font-size: 1.1rem; background: white; color: #2c3e50;
  transition: border-color 0.3s;
}
.socio-select:focus { outline: none; border-color: #2196f3; box-shadow: 0 0 0 3px rgba(33,150,243,0.1); }
.btn-buscar {
  background: linear-gradient(135deg, #1565c0, #2196f3); color: white; border: none;
  padding: 1rem 2rem; border-radius: 10px; font-weight: 700; font-size: 1.1rem;
  cursor: pointer; display: flex; align-items: center; gap: 0.6rem;
  transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 4px 16px rgba(33,150,243,0.3);
}
.btn-buscar:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(33,150,243,0.4); }
.btn-buscar:disabled { opacity: 0.7; cursor: not-allowed; }

/* INFORMACIÓN DEL SOCIO */
.socio-section { margin-bottom: 2rem; }
.socio-info-card {
  background: linear-gradient(135deg, #e3f2fd, #f3e5f5); border-radius: 16px; padding: 2rem;
  margin-bottom: 2rem; display: flex; align-items: center; gap: 1.5rem;
  box-shadow: 0 6px 20px rgba(33,150,243,0.1);
}
.socio-avatar {
  width: 80px; height: 80px; background: linear-gradient(135deg, #1565c0, #2196f3);
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  color: white; font-size: 2rem; box-shadow: 0 4px 16px rgba(33,150,243,0.3);
}
.socio-datos h2 { margin: 0; color: #1565c0; font-size: 1.8rem; font-weight: 700; }
.socio-numero { margin: 0.5rem 0 0; color: #546e7a; font-size: 1.1rem; font-weight: 500; }
/* RESUMEN FINANCIERO */
.resumen-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem; margin-bottom: 2rem;
}
.resumen-card {
  background: white; border-radius: 16px; padding: 0; overflow: hidden;
  box-shadow: 0 6px 20px rgba(0,0,0,0.08); transition: transform 0.3s;
}
.resumen-card:hover { transform: translateY(-4px); }
.resumen-card.ahorros { border-top: 5px solid #2196f3; }
.resumen-card.prestamos { border-top: 5px solid #1565c0; }
.resumen-card.balance { border-top: 5px solid #0d47a1; }
.resumen-header {
  padding: 1.5rem; border-bottom: 1px solid #f0f0f0;
  display: flex; align-items: center; gap: 1rem;
}
.resumen-header i { font-size: 1.5rem; }
.resumen-card.ahorros .resumen-header i { color: #2196f3; }
.resumen-card.prestamos .resumen-header i { color: #1565c0; }
.resumen-card.balance .resumen-header i { color: #0d47a1; }
.resumen-header h4 { margin: 0; color: #2c3e50; font-size: 1.1rem; font-weight: 700; }
.resumen-body { padding: 1.5rem; text-align: center; }
.resumen-monto { display: block; font-size: 2rem; font-weight: 800; color: #2c3e50; margin-bottom: 0.5rem; }
.resumen-label { color: #7f8c8d; font-size: 0.9rem; font-weight: 600; }

/* HISTORIAL */
.historial-section {
  background: white; border-radius: 16px; padding: 0; overflow: hidden;
  box-shadow: 0 8px 25px rgba(0,0,0,0.1); border-top: 5px solid #2196f3;
}
.historial-header {
  padding: 2rem; border-bottom: 2px solid #f0f0f0;
  display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;
}
.historial-header h3 {
  margin: 0; color: #1565c0; font-size: 1.4rem; font-weight: 700;
  display: flex; align-items: center; gap: 0.6rem;
}
.badge {
  background: linear-gradient(135deg, #2196f3, #64b5f6); color: white;
  padding: 0.4rem 1rem; border-radius: 20px; font-size: 0.9rem; font-weight: 600;
}
.tabla-container { overflow-x: auto; }
.tabla-movimientos {
  width: 100%; border-collapse: collapse; background: white;
}
.tabla-movimientos th {
  background: linear-gradient(135deg, #1565c0, #2196f3); color: white;
  padding: 1rem; text-align: left; font-weight: 700; font-size: 0.9rem;
}
.tabla-movimientos th i { margin-right: 0.5rem; }
.tabla-fila { transition: background 0.2s; }
.tabla-fila:hover { background: #f8f9fa; }
.tabla-movimientos td { padding: 1rem; border-bottom: 1px solid #f0f0f0; font-size: 0.95rem; }
.tipo-badge {
  padding: 0.4rem 0.8rem; border-radius: 20px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;
}
.tipo-badge.ingreso { background: #e3f2fd; color: #1565c0; }
.tipo-badge.egreso { background: #e8eaf6; color: #3f51b5; }
.monto { font-weight: 700; }
.monto.positivo { color: #2e7d32; }
.monto.negativo { color: #c62828; }
/* ESTADOS */
.sin-movimientos {
  padding: 4rem 2rem; text-align: center;
}
.sin-movimientos-content i {
  font-size: 4rem; color: #bdc3c7; margin-bottom: 1rem;
}
.sin-movimientos-content h4 {
  margin: 0 0 0.5rem; color: #7f8c8d; font-size: 1.3rem; font-weight: 600;
}
.sin-movimientos-content p {
  margin: 0; color: #95a5a6; font-size: 1rem;
}

.estado-inicial {
  background: white; border-radius: 16px; padding: 4rem 2rem;
  box-shadow: 0 6px 20px rgba(0,0,0,0.08); text-align: center;
}
.estado-content i {
  font-size: 5rem; color: #64b5f6; margin-bottom: 1.5rem;
}
.estado-content h3 {
  margin: 0 0 1rem; color: #1565c0; font-size: 1.8rem; font-weight: 700;
}
.estado-content p {
  margin: 0 0 2rem; color: #546e7a; font-size: 1.1rem; max-width: 500px; margin-left: auto; margin-right: auto;
}
.stats-generales { display: flex; justify-content: center; gap: 2rem; }
.stat-item { text-align: center; }
.stat-number {
  display: block; font-size: 2.5rem; font-weight: 800; color: #2196f3; margin-bottom: 0.3rem;
}
.stat-text {
  display: block; color: #7f8c8d; font-size: 0.9rem; font-weight: 600; text-transform: uppercase;
}
.resumen-socios-section {
  margin-bottom: 2rem;
}

.resumen-socios-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
}

.resumen-socios-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.resumen-socios-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #1565c0;
}

.resumen-socios-subtitle {
  color: #607d8b;
  font-size: 0.95rem;
}

.tabla-resumen-socios {
  width: 100%;
  border-collapse: collapse;
  min-width: 360px;
}

.tabla-resumen-socios th,
.tabla-resumen-socios td {
  padding: 0.9rem 1rem;
  border-bottom: 1px solid #e0e0e0;
  text-align: left;
}

.tabla-resumen-socios th {
  background: #f3f6fb;
  color: #37474f;
  font-weight: 700;
}

.tabla-resumen-socios td {
  color: #455a64;
}

.tabla-resumen-socios tr:last-child td {
  border-bottom: none;
}
/* RESPONSIVE */
@media (max-width: 1024px) {
  .header-section { flex-direction: column; text-align: center; }
  .input-group { flex-direction: column; align-items: stretch; }
  .socio-select { min-width: auto; }
}

@media (max-width: 768px) {
  .movimiento-container { padding: 1rem; }
  .resumen-grid { grid-template-columns: 1fr; }
  .header-stats { flex-direction: column; width: 100%; }
  .historial-header { flex-direction: column; text-align: center; }
}

@keyframes slideInRight {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
</style>