<template>
  <div class="circulacion-container">
    <!-- HEADER -->
    <div class="header-section">
      <div class="header-content">
        <div class="header-icon">
          <i class="fas fa-sync-alt"></i>
        </div>
        <div class="header-text">
          <h1>Total en Circulación</h1>
          <p class="subtitle">Resumen consolidado de todo el dinero que circula en la caja</p>
        </div>
      </div>
      <div class="header-stats">
        <div class="stat-card">
          <div class="stat-icon"><i class="fas fa-wallet"></i></div>
          <div class="stat-info">
            <span class="stat-label">Saldo Total Disponible</span>
            <span class="stat-value">${{ format(resumen.saldoDisponible) }}</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon"><i class="fas fa-coins"></i></div>
          <div class="stat-info">
            <span class="stat-label">Total en Circulación</span>
            <span class="stat-value">${{ format(resumen.totalCirculacion) }}</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon"><i class="fas fa-chart-pie"></i></div>
          <div class="stat-info">
            <span class="stat-label">Capital Total</span>
            <span class="stat-value">${{ format(resumen.capitalTotal) }}</span>
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

    <!-- ACTIONS BAR -->
    <div class="actions-bar">
      <button class="btn-primary" @click="cargarTodo" :disabled="loading">
        <i :class="loading ? 'fas fa-spinner fa-spin' : 'fas fa-sync-alt'"></i>
        <span>{{ loading ? 'Calculando...' : 'Actualizar' }}</span>
      </button>
      <div class="last-update">
        <i class="fas fa-clock"></i>
        <span>Última actualización: {{ lastUpdate || 'Nunca' }}</span>
      </div>
    </div>

    <!-- TARJETAS POR SECCIÓN -->
    <div class="seccion-grid">

      <!-- CAJA GENERAL -->
      <div class="seccion-card">
        <div class="seccion-header caja-general">
          <i class="fas fa-cash-register"></i>
          <h3>Caja General</h3>
        </div>
        <div class="seccion-body">
          <div class="seccion-fila ingreso">
            <span><i class="fas fa-arrow-up"></i> Ingresos</span>
            <span>${{ format(cajaGeneral.ingresos) }}</span>
          </div>
          <div class="seccion-fila egreso">
            <span><i class="fas fa-arrow-down"></i> Egresos</span>
            <span>${{ format(cajaGeneral.egresos) }}</span>
          </div>
          <div class="seccion-fila total">
            <span><i class="fas fa-equals"></i> Saldo Neto</span>
            <span :class="cajaGeneral.saldo >= 0 ? 'positivo' : 'negativo'">${{ format(cajaGeneral.saldo) }}</span>
          </div>
        </div>
      </div>

      <!-- CAJA CHICA -->
      <div class="seccion-card">
        <div class="seccion-header caja-chica">
          <i class="fas fa-piggy-bank"></i>
          <h3>Caja Chica</h3>
        </div>
        <div class="seccion-body">
          <div class="seccion-fila ingreso">
            <span><i class="fas fa-arrow-up"></i> Ingresos</span>
            <span>${{ format(cajaChica.ingresos) }}</span>
          </div>
          <div class="seccion-fila egreso">
            <span><i class="fas fa-arrow-down"></i> Egresos</span>
            <span>${{ format(cajaChica.egresos) }}</span>
          </div>
          <div class="seccion-fila total">
            <span><i class="fas fa-equals"></i> Saldo Neto</span>
            <span :class="cajaChica.saldo >= 0 ? 'positivo' : 'negativo'">${{ format(cajaChica.saldo) }}</span>
          </div>
        </div>
      </div>

      <!-- APORTES DE SOCIOS -->
      <div class="seccion-card">
        <div class="seccion-header aportes">
          <i class="fas fa-users"></i>
          <h3>Aportes de Socios</h3>
        </div>
        <div class="seccion-body">
          <div class="seccion-fila ingreso">
            <span><i class="fas fa-user-plus"></i> Aportes Iniciales</span>
            <span>${{ format(aportesSocios.aporteInicial) }}</span>
          </div>
          <div class="seccion-fila ingreso">
            <span><i class="fas fa-hand-holding-usd"></i> Depósitos</span>
            <span>${{ format(aportesSocios.depositos) }}</span>
          </div>
          <div class="seccion-fila egreso">
            <span><i class="fas fa-hand-paper"></i> Retiros</span>
            <span>${{ format(aportesSocios.retiros) }}</span>
          </div>
          <div class="seccion-fila total">
            <span><i class="fas fa-equals"></i> Saldo Total Ahorros</span>
            <span class="positivo">${{ format(aportesSocios.saldoAhorros) }}</span>
          </div>
        </div>
      </div>

      <!-- PRÉSTAMOS -->
      <div class="seccion-card">
        <div class="seccion-header prestamos">
          <i class="fas fa-file-invoice-dollar"></i>
          <h3>Préstamos Activos</h3>
        </div>
        <div class="seccion-body">
          <div class="seccion-fila egreso">
            <span><i class="fas fa-money-bill-wave"></i> Capital Prestado</span>
            <span>${{ format(prestamos.capitalPrestado) }}</span>
          </div>
          <div class="seccion-fila ingreso">
            <span><i class="fas fa-percentage"></i> Intereses por Cobrar</span>
            <span>${{ format(prestamos.interesesPorCobrar) }}</span>
          </div>
          <div class="seccion-fila total">
            <span><i class="fas fa-equals"></i> Total a Recuperar</span>
            <span class="positivo">${{ format(prestamos.totalRecuperar) }}</span>
          </div>
          <div class="seccion-fila">
            <span><i class="fas fa-list-ol"></i> N° Préstamos Activos</span>
            <span>{{ prestamos.cantidad }}</span>
          </div>
        </div>
      </div>

    </div>

    <!-- RESUMEN FINAL CONSOLIDADO -->
    <div class="resumen-final">
      <h3><i class="fas fa-calculator"></i> Resumen Consolidado</h3>
      <div class="resumen-tabla">
        <div class="resumen-fila">
          <span class="resumen-concepto"><i class="fas fa-cash-register"></i> Saldo Caja General</span>
          <span class="resumen-monto" :class="cajaGeneral.saldo >= 0 ? 'positivo' : 'negativo'">${{ format(cajaGeneral.saldo) }}</span>
        </div>
        <div class="resumen-fila">
          <span class="resumen-concepto"><i class="fas fa-piggy-bank"></i> Saldo Caja Chica</span>
          <span class="resumen-monto" :class="cajaChica.saldo >= 0 ? 'positivo' : 'negativo'">${{ format(cajaChica.saldo) }}</span>
        </div>
        <div class="resumen-fila">
          <span class="resumen-concepto"><i class="fas fa-users"></i> Total Ahorros de Socios</span>
          <span class="resumen-monto positivo">${{ format(aportesSocios.saldoAhorros) }}</span>
        </div>
        <div class="resumen-fila">
          <span class="resumen-concepto"><i class="fas fa-file-invoice-dollar"></i> Capital en Préstamos</span>
          <span class="resumen-monto egreso-color">-${{ format(prestamos.capitalPrestado) }}</span>
        </div>
        <div class="resumen-fila">
          <span class="resumen-concepto"><i class="fas fa-percentage"></i> Intereses por Cobrar</span>
          <span class="resumen-monto positivo">${{ format(prestamos.interesesPorCobrar) }}</span>
        </div>
        <div class="resumen-divisor"></div>
        <div class="resumen-fila total-final">
          <span class="resumen-concepto"><i class="fas fa-coins"></i> TOTAL EN CIRCULACIÓN</span>
          <span class="resumen-monto total-monto">${{ format(resumen.totalCirculacion) }}</span>
        </div>
        <div class="resumen-fila capital-final">
          <span class="resumen-concepto"><i class="fas fa-chart-pie"></i> CAPITAL TOTAL (incl. préstamos)</span>
          <span class="resumen-monto capital-monto">${{ format(resumen.capitalTotal) }}</span>
        </div>
        <div class="resumen-fila disponible-final">
          <span class="resumen-concepto"><i class="fas fa-wallet"></i> SALDO DISPONIBLE EN CAJA</span>
          <span class="resumen-monto" :class="resumen.saldoDisponible >= 0 ? 'total-monto' : 'negativo'">${{ format(resumen.saldoDisponible) }}</span>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const loading = ref(false)
const lastUpdate = ref('')

const notification = ref({ show: false, type: 'success', icon: '', message: '' })

const showNotification = (type, icon, message) => {
  notification.value = { show: true, type, icon, message }
  setTimeout(() => (notification.value.show = false), 4000)
}

// Datos crudos de cada fuente
const datosCajaGeneral   = ref([])
const datosCajaChica     = ref([])
const datosAportes       = ref([])
const datosPrestamos     = ref([])

// Datos para Movimiento Individual
const listaSocios = ref([])
const socioSeleccionado = ref('')
const movimientoSocio = ref(null)
const loadingMovimiento = ref(false)

// ===== CAJA GENERAL =====
const cajaGeneral = computed(() => {
  const ingresos = datosCajaGeneral.value
    .filter(m => m.tipo === 'ingreso')
    .reduce((s, m) => s + Number(m.monto || 0), 0)
  const egresos = datosCajaGeneral.value
    .filter(m => m.tipo === 'egreso')
    .reduce((s, m) => s + Number(m.monto || 0), 0)
  return { ingresos, egresos, saldo: ingresos - egresos }
})

// ===== CAJA CHICA =====
const cajaChica = computed(() => {
  const ingresos = datosCajaChica.value.reduce((s, r) => s + Number(r.ingresos || 0), 0)
  const egresos  = datosCajaChica.value.reduce((s, r) => s + Number(r.egresos  || 0), 0)
  return { ingresos, egresos, saldo: ingresos - egresos }
})

// ===== APORTES DE SOCIOS =====
const aportesSocios = computed(() => {
  const aporteInicial = datosAportes.value.reduce((s, r) => s + Number(r.aporte_inicial || 0), 0)
  const depositos     = datosAportes.value.reduce((s, r) => s + Number(r.deposito      || 0), 0)
  const retiros       = datosAportes.value.reduce((s, r) => s + Number(r.retiro        || 0), 0)
  const saldoAhorros  = datosAportes.value.reduce((s, r) => s + Number(r.saldo_ahorros || 0), 0)
  return { aporteInicial, depositos, retiros, saldoAhorros }
})

// ===== PRÉSTAMOS ACTIVOS =====
const prestamos = computed(() => {
  const activos = datosPrestamos.value.filter(p => {
    const estado = (p.estado || '').toLowerCase()
    return estado === 'activo' || estado === 'pendiente' || estado === 'en curso' || estado === ''
  })
  const capitalPrestado = activos.reduce((s, p) => s + Number(p.monto || 0), 0)
  const interesesPorCobrar = activos.reduce((s, p) => {
    const monto  = Number(p.monto  || 0)
    const interes = Number(p.interes || 0)
    const plazo  = Number(p.plazo  || 1)
    return s + (monto * interes * plazo) / 100
  }, 0)
  return {
    capitalPrestado,
    interesesPorCobrar,
    totalRecuperar: capitalPrestado + interesesPorCobrar,
    cantidad: activos.length
  }
})

// ===== RESUMEN CONSOLIDADO =====
const resumen = computed(() => {
  // Saldo disponible = dinero que físicamente está en caja (caja general + caja chica)
  const saldoDisponible = cajaGeneral.value.saldo + cajaChica.value.saldo

  // Total en circulación = saldo disponible + capital que está afuera en préstamos + intereses por cobrar
  const totalCirculacion = saldoDisponible + prestamos.value.capitalPrestado + prestamos.value.interesesPorCobrar

  // Capital total = todo el dinero que existe (ahorros de socios es la base)
  const capitalTotal = aportesSocios.value.saldoAhorros + prestamos.value.interesesPorCobrar

  return { saldoDisponible, totalCirculacion, capitalTotal }
})

// ===== CARGA DE DATOS =====
const cargarTodo = async () => {
  loading.value = true
  const errores = []

  const fetchSafe = async (url, fallback = []) => {
    try {
      const r = await fetch(url)
      const j = await r.json()
      return j.success ? j.data : fallback
    } catch {
      errores.push(url)
      return fallback
    }
  }

  // Try backend consolidated endpoint first
  try {
    const r = await fetch('/api/resumen-circulacion')
    const j = await r.json()
    if (j && j.success && j.data) {
      const d = j.data

      // Normalize into the arrays used by computed properties
      datosCajaGeneral.value = [
        { tipo: 'ingreso', monto: d.cajaGeneral.ingresos },
        { tipo: 'egreso', monto: d.cajaGeneral.egresos }
      ]

      datosCajaChica.value = [ { ingresos: d.cajaChica.ingresos, egresos: d.cajaChica.egresos } ]

      datosAportes.value = [ { aporte_inicial: d.aportes.aporteInicial, deposito: d.aportes.depositos, retiro: d.aportes.retiros, saldo_ahorros: d.aportes.saldoAhorros } ]

      // If backend returned activos list, use it; otherwise synthesize a single item
      datosPrestamos.value = Array.isArray(d.prestamos?.activos) && d.prestamos.activos.length > 0
        ? d.prestamos.activos
        : [ { monto: d.prestamos.capitalPrestado, interes: 0, plazo: 0, estado: 'activo' } ]

      lastUpdate.value = new Date().toLocaleString('es-ES', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      })

      showNotification('success', '✅', 'Resumen consolidado cargado desde servidor')
      loading.value = false
      return
    }
  } catch (err) {
    errores.push('/api/resumen-circulacion')
  }

  // Fallback: load individual endpoints
  const [cg, cc, ap, pr] = await Promise.all([
    fetchSafe('/api/caja-general'),
    fetchSafe('/api/caja-chica'),
    fetchSafe('/api/registro-aportes'),
    fetchSafe('/api/prestamos'),
  ])

  datosCajaGeneral.value = cg
  datosCajaChica.value   = cc
  datosAportes.value     = ap
  datosPrestamos.value   = pr

  lastUpdate.value = new Date().toLocaleString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })

  if (errores.length > 0) {
    showNotification('warning', '⚠️', `No se pudieron cargar algunos datos`)
  } else {
    showNotification('success', '✅', 'Datos cargados correctamente')
  }

  loading.value = false
}

// ===== MOVIMIENTO INDIVIDUAL =====
const cargarSocios = async () => {
  console.log('🔍 Cargando lista de socios...')
  try {
    const response = await fetch('/api/socios')
    const data = await response.json()
    console.log('📋 Respuesta de socios:', data)
    if (data.success) {
      listaSocios.value = data.data.sort((a, b) => a.numero_socio - b.numero_socio)
      console.log('✅ Socios cargados:', listaSocios.value.length)
    }
  } catch (error) {
    console.error('❌ Error cargando socios:', error)
  }
}

const cargarMovimientoSocio = async () => {
  console.log('🔍 Cargando movimiento del socio:', socioSeleccionado.value)
  if (!socioSeleccionado.value) return
  
  loadingMovimiento.value = true
  try {
    const response = await fetch(`/api/movimiento-socio/${socioSeleccionado.value}`)
    const data = await response.json()
    console.log('📊 Respuesta de movimiento:', data)
    
    if (data.success) {
      movimientoSocio.value = data.data
      console.log('✅ Movimiento cargado:', movimientoSocio.value)
      showNotification('success', '✅', 'Movimiento individual cargado correctamente')
    } else {
      console.error('❌ Error en respuesta:', data.message)
      showNotification('error', '❌', 'Error al cargar movimiento del socio')
    }
  } catch (error) {
    console.error('❌ Error cargando movimiento del socio:', error)
    showNotification('error', '❌', 'Error de conexión al cargar movimiento')
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
  console.log('🚀 Componente TotalEnCirculacion montado')
  cargarTodo()
  cargarSocios()
  console.log('📊 Estado inicial - listaSocios:', listaSocios.value.length)
})
</script>

<style scoped>
.circulacion-container {
  background-color: #f5f7fa;
  min-height: 100vh;
  padding: 2rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* HEADER */
.header-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 20px rgba(106,27,154,0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 2rem;
}
.header-content { display: flex; align-items: center; gap: 1.5rem; }
.header-icon {
  background: linear-gradient(135deg, #6a1b9a, #ab47bc);
  color: white; width: 60px; height: 60px; border-radius: 16px;
  display: flex; align-items: center; justify-content: center; font-size: 1.5rem;
  box-shadow: 0 4px 12px rgba(106,27,154,0.3);
}
.header-text h1 { margin: 0; color: #4a148c; font-size: 2rem; font-weight: 700; }
.subtitle { margin: 0.5rem 0 0; color: #546e7a; font-size: 1rem; }
.header-stats { display: flex; gap: 1.5rem; flex-wrap: wrap; }
.stat-card {
  background: white; padding: 1.2rem 1.5rem; border-radius: 14px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.08); min-width: 160px; text-align: center;
  transition: transform 0.3s; border-top: 3px solid #7b1fa2;
}
.stat-card:hover { transform: translateY(-4px); }
.stat-icon { font-size: 1.8rem; color: #7b1fa2; margin-bottom: 0.4rem; }
.stat-label { display: block; color: #7f8c8d; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; margin-bottom: 0.3rem; }
.stat-value { display: block; color: #2c3e50; font-size: 1.3rem; font-weight: 800; }

/* NOTIFICATION */
.notification {
  position: fixed; top: 20px; right: 20px; background: white;
  border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  z-index: 1000; min-width: 350px; animation: slideInRight 0.3s ease;
}
.notification.success { border-left: 4px solid #27ae60; }
.notification.warning { border-left: 4px solid #f39c12; }
.notification.error   { border-left: 4px solid #e74c3c; }
.notification-content { display: flex; align-items: center; gap: 1rem; padding: 1rem 1.5rem; }
.notification-icon { font-size: 1.4rem; }
.notification-message { flex: 1; font-weight: 500; color: #2c3e50; }
.notification-close { background: none; border: none; color: #7f8c8d; font-size: 1.2rem; cursor: pointer; padding: 0.5rem; border-radius: 50%; }
.notification-close:hover { background-color: #f8f9fa; }

/* ACTIONS BAR */
.actions-bar {
  background: white; border-radius: 14px; padding: 1.2rem 1.5rem;
  margin-bottom: 2rem; box-shadow: 0 4px 16px rgba(0,0,0,0.06);
  display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;
}
.btn-primary {
  background: linear-gradient(135deg, #6a1b9a, #ab47bc); color: white; border: none;
  padding: 0.75rem 1.5rem; border-radius: 10px; font-weight: 600; font-size: 1rem;
  cursor: pointer; display: flex; align-items: center; gap: 0.5rem;
  transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 4px 12px rgba(106,27,154,0.3);
}
.btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(106,27,154,0.4); }
.btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
.last-update { display: flex; align-items: center; gap: 0.5rem; color: #546e7a; font-size: 0.9rem; }
.last-update i { color: #7b1fa2; }

/* SECCIONES GRID */
.seccion-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}
.seccion-card {
  background: white; border-radius: 14px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.07); overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
}
.seccion-card:hover { transform: translateY(-4px); box-shadow: 0 12px 30px rgba(0,0,0,0.12); }

.seccion-header {
  display: flex; align-items: center; gap: 0.75rem;
  padding: 1.2rem 1.5rem; color: white; font-size: 1rem;
}
.seccion-header h3 { margin: 0; font-size: 1.1rem; font-weight: 700; }
.seccion-header i { font-size: 1.3rem; }
.seccion-header.caja-general { background: linear-gradient(135deg, #1565c0, #1e88e5); }
.seccion-header.caja-chica   { background: linear-gradient(135deg, #2e7d32, #43a047); }
.seccion-header.aportes      { background: linear-gradient(135deg, #e65100, #fb8c00); }
.seccion-header.prestamos    { background: linear-gradient(135deg, #6a1b9a, #ab47bc); }

.seccion-body { padding: 1.2rem 1.5rem; }
.seccion-fila {
  display: flex; justify-content: space-between; align-items: center;
  padding: 0.65rem 0; border-bottom: 1px solid #f1f3f4; font-size: 0.95rem; color: #455a64;
}
.seccion-fila:last-child { border-bottom: none; }
.seccion-fila span:first-child { display: flex; align-items: center; gap: 0.5rem; }
.seccion-fila span:first-child i { width: 16px; }
.seccion-fila.ingreso span:last-child { color: #1565c0; font-weight: 700; }
.seccion-fila.egreso  span:last-child { color: #c62828; font-weight: 700; }
.seccion-fila.total   { background: #f8f9fa; border-radius: 8px; padding: 0.65rem 0.5rem; margin-top: 0.5rem; font-weight: 700; }
.positivo   { color: #2e7d32 !important; font-weight: 800 !important; }
.negativo   { color: #c62828 !important; font-weight: 800 !important; }
.egreso-color { color: #c62828 !important; font-weight: 700; }

/* MOVIMIENTO INDIVIDUAL */
.movimiento-individual {
  background: white; border-radius: 16px; padding: 2rem;
  box-shadow: 0 8px 25px rgba(33,150,243,0.1); border-top: 4px solid #2196f3;
  margin-bottom: 2rem;
}
.movimiento-individual h3 {
  margin: 0 0 1.5rem; color: #1565c0; font-size: 1.4rem; font-weight: 700;
  display: flex; align-items: center; gap: 0.6rem;
}
.movimiento-individual h3 i { color: #2196f3; }

.buscar-socio { margin-bottom: 2rem; }
.input-group {
  display: flex; align-items: end; gap: 1rem; flex-wrap: wrap;
}
.input-group label {
  display: block; margin-bottom: 0.5rem; color: #455a64; font-weight: 600; font-size: 0.9rem;
}
.socio-select {
  flex: 1; min-width: 200px; padding: 0.75rem 1rem; border: 2px solid #e0e0e0;
  border-radius: 8px; font-size: 1rem; background: white; color: #2c3e50;
  transition: border-color 0.3s; 
}
.socio-select:focus { outline: none; border-color: #2196f3; }
.btn-buscar {
  background: linear-gradient(135deg, #1565c0, #1976d2); color: white; border: none;
  padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600;
  cursor: pointer; display: flex; align-items: center; gap: 0.5rem;
  transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 4px 12px rgba(25,118,210,0.3);
}
.btn-buscar:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(25,118,210,0.4); }
.btn-buscar:disabled { opacity: 0.7; cursor: not-allowed; }

.movimiento-detalle { margin-top: 2rem; }
.socio-info {
  display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem;
  padding: 1rem; background: linear-gradient(135deg, #e3f2fd, #f3e5f5); border-radius: 12px;
}
.socio-avatar {
  width: 60px; height: 60px; background: linear-gradient(135deg, #1565c0, #1976d2);
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  color: white; font-size: 1.5rem;
}
.socio-datos h4 { margin: 0; color: #1565c0; font-size: 1.2rem; font-weight: 700; }
.socio-datos p { margin: 0.3rem 0 0; color: #546e7a; font-size: 0.9rem; }

.movimiento-resumen {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem; margin-bottom: 2rem;
}
.resumen-card {
  background: white; border-radius: 12px; padding: 1.2rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08); display: flex; align-items: center; gap: 1rem;
  transition: transform 0.3s;
}
.resumen-card:hover { transform: translateY(-2px); }
.resumen-card.ahorros { border-left: 4px solid #4caf50; }
.resumen-card.prestamos { border-left: 4px solid #ff9800; }
.resumen-card.balance { border-left: 4px solid #9c27b0; }

.resumen-icon {
  width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
  font-size: 1.2rem; color: white;
}
.resumen-card.ahorros .resumen-icon { background: linear-gradient(135deg, #4caf50, #66bb6a); }
.resumen-card.prestamos .resumen-icon { background: linear-gradient(135deg, #ff9800, #ffb74d); }
.resumen-card.balance .resumen-icon { background: linear-gradient(135deg, #9c27b0, #ba68c8); }

.resumen-info { flex: 1; }
.resumen-label { display: block; color: #546e7a; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.3rem; }
.resumen-valor { display: block; color: #2c3e50; font-size: 1.3rem; font-weight: 800; }

.movimiento-historico h4 {
  margin: 0 0 1rem; color: #1565c0; font-size: 1.1rem; font-weight: 700;
  display: flex; align-items: center; gap: 0.5rem;
}
.tabla-movimientos {
  border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}
.tabla-header {
  display: grid; grid-template-columns: 1fr 1fr 2fr 1fr; gap: 1rem;
  padding: 1rem; background: linear-gradient(135deg, #1565c0, #1976d2); color: white;
  font-weight: 700; font-size: 0.9rem;
}
.tabla-fila {
  display: grid; grid-template-columns: 1fr 1fr 2fr 1fr; gap: 1rem; align-items: center;
  padding: 0.8rem 1rem; background: white; border-bottom: 1px solid #f0f0f0;
  transition: background 0.2s; font-size: 0.9rem;
}
.tabla-fila:hover { background: #f8f9fa; }
.tabla-fila:last-child { border-bottom: none; }

.tipo-badge {
  padding: 0.3rem 0.7rem; border-radius: 20px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;
}
.tipo-badge.ingreso { background: #e8f5e8; color: #2e7d32; }
.tipo-badge.egreso { background: #ffebee; color: #c62828; }
.tipo-badge.deposito { background: #e3f2fd; color: #1565c0; }
.tipo-badge.retiro { background: #fff3e0; color: #ef6c00; }
.tipo-badge.prestamo { background: #f3e5f5; color: #7b1fa2; }

.sin-movimientos, .sin-datos, .seleccionar-socio {
  text-align: center; padding: 3rem 2rem; color: #7f8c8d;
}
.sin-movimientos i, .sin-datos i, .seleccionar-socio i {
  font-size: 3rem; margin-bottom: 1rem; color: #bdc3c7;
}
.sin-movimientos p, .sin-datos p, .seleccionar-socio p {
  margin: 0; font-size: 1.1rem; font-weight: 500;
}

/* RESUMEN FINAL */
.resumen-final {
  background: white; border-radius: 16px; padding: 2rem;
  box-shadow: 0 8px 25px rgba(106,27,154,0.1); border-top: 4px solid #7b1fa2;
}
.resumen-final h3 {
  margin: 0 0 1.5rem; color: #4a148c; font-size: 1.4rem; font-weight: 700;
  display: flex; align-items: center; gap: 0.6rem;
}
.resumen-final h3 i { color: #7b1fa2; }
.resumen-tabla { display: flex; flex-direction: column; gap: 0; }
.resumen-fila {
  display: flex; justify-content: space-between; align-items: center;
  padding: 0.9rem 1rem; border-bottom: 1px solid #f0f0f0;
  transition: background 0.2s;
}
.resumen-fila:hover { background: #fce4ec; border-radius: 8px; }
.resumen-concepto { display: flex; align-items: center; gap: 0.6rem; color: #455a64; font-size: 1rem; }
.resumen-concepto i { color: #7b1fa2; width: 18px; }
.resumen-monto { font-size: 1.1rem; font-weight: 700; }
.resumen-divisor { height: 2px; background: linear-gradient(135deg, #6a1b9a, #ab47bc); margin: 0.75rem 0; border-radius: 2px; }

.total-final, .capital-final, .disponible-final {
  border-radius: 10px; margin-top: 0.4rem; padding: 1rem 1.2rem !important;
}
.total-final     { background: linear-gradient(135deg, #f3e5f5, #ede7f6); }
.capital-final   { background: linear-gradient(135deg, #e8f5e9, #f1f8e9); }
.disponible-final { background: linear-gradient(135deg, #e3f2fd, #e8eaf6); }
.total-final .resumen-concepto,
.capital-final .resumen-concepto,
.disponible-final .resumen-concepto { font-weight: 800; font-size: 1.05rem; color: #2c3e50; }
.total-monto   { color: #4a148c !important; font-size: 1.3rem !important; }
.capital-monto { color: #1b5e20 !important; font-size: 1.3rem !important; }

/* RESPONSIVE */
@media (max-width: 1024px) { .header-section { flex-direction: column; text-align: center; } .header-stats { justify-content: center; } }
@media (max-width: 768px)  { .circulacion-container { padding: 1rem; } .seccion-grid { grid-template-columns: 1fr; } .header-stats { flex-direction: column; width: 100%; } }

@keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
@keyframes fadeInUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
.header-section, .actions-bar, .seccion-card, .resumen-final { animation: fadeInUp 0.5s ease; }

::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-thumb { background: linear-gradient(135deg, #6a1b9a, #ab47bc); border-radius: 4px; }
</style>
