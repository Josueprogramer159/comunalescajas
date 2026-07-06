<template>
  <div class="balance-general-container">
    <!-- HEADER SECTION -->
    <div class="header-section">
      <div class="header-content">
        <div class="header-icon">
          <i class="fas fa-balance-scale"></i>
        </div>
        <div class="header-text">
          <h1>Balance General</h1>
          <p class="subtitle">Estado financiero consolidado basado en aportes de socios</p>
        </div>
      </div>
      <div class="header-stats">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-piggy-bank"></i>
          </div>
          <div class="stat-info">
            <span class="stat-label">Total Ahorros</span>
            <span class="stat-value">${{ format(totales.totalAhorros) }}</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-coins"></i>
          </div>
          <div class="stat-info">
            <span class="stat-label">Patrimonio Neto</span>
            <span class="stat-value">${{ format(totales.patrimonioNeto) }}</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-users"></i>
          </div>
          <div class="stat-info">
            <span class="stat-label">Socios Activos</span>
            <span class="stat-value">{{ totales.sociosActivos }}</span>
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
      <button class="btn-primary" @click="calcularBalance">
        <i class="fas fa-calculator"></i>
        <span>Calcular Balance</span>
      </button>
      <div class="last-update">
        <i class="fas fa-clock"></i>
        <span>Última actualización: {{ lastUpdate }}</span>
      </div>
    </div>

    <!-- BALANCE SHEET SECTIONS -->
    <div class="balance-sections">
      <!-- ACTIVO -->
      <div class="balance-section activo-section">
        <div class="section-header">
          <h3>
            <i class="fas fa-plus-circle"></i>
            ACTIVO
          </h3>
          <div class="section-total">${{ format(totales.activoTotal) }}</div>
        </div>

        <div class="balance-items">
          <div class="balance-item">
            <div class="item-label">
              <i class="fas fa-cash-register"></i>
              <span>Caja y Bancos</span>
            </div>
            <div class="item-value">${{ format(totales.cajaYBancos) }}</div>
          </div>

          <div class="balance-item">
            <div class="item-label">
              <i class="fas fa-hand-holding-usd"></i>
              <span>Ahorros de Socios</span>
            </div>
            <div class="item-value">${{ format(totales.ahorrosSocios) }}</div>
          </div>

          <div class="balance-item">
            <div class="item-label">
              <i class="fas fa-credit-card"></i>
              <span>Prestamos por Cobrar</span>
            </div>
            <div class="item-value">${{ format(totales.prestamosPorCobrar) }}</div>
          </div>
        </div>
      </div>

      <!-- PASIVO -->
      <div class="balance-section pasivo-section">
        <div class="section-header">
          <h3>
            <i class="fas fa-minus-circle"></i>
            PASIVO
          </h3>
          <div class="section-total">${{ format(totales.pasivoTotal) }}</div>
        </div>

        <div class="balance-items">
          <div class="balance-item">
            <div class="item-label">
              <i class="fas fa-file-invoice-dollar"></i>
              <span>Cuentas por Pagar</span>
            </div>
            <div class="item-value">${{ format(totales.cuentasPorPagar) }}</div>
          </div>

          <div class="balance-item">
            <div class="item-label">
              <i class="fas fa-money-bill-wave"></i>
              <span>Prestamos Recibidos</span>
            </div>
            <div class="item-value">${{ format(totales.prestamosRecibidos) }}</div>
          </div>
        </div>
      </div>

      <!-- PATRIMONIO -->
      <div class="balance-section patrimonio-section">
        <div class="section-header">
          <h3>
            <i class="fas fa-equals"></i>
            PATRIMONIO
          </h3>
          <div class="section-total">${{ format(totales.patrimonioTotal) }}</div>
        </div>

        <div class="balance-items">
          <div class="balance-item">
            <div class="item-label">
              <i class="fas fa-chart-line"></i>
              <span>Capital Social</span>
            </div>
            <div class="item-value">${{ format(totales.capitalSocial) }}</div>
          </div>

          <div class="balance-item">
            <div class="item-label">
              <i class="fas fa-piggy-bank"></i>
              <span>Reservas y Utilidades</span>
            </div>
            <div class="item-value">${{ format(totales.reservasUtilidades) }}</div>
          </div>

          <div class="balance-item highlighted">
            <div class="item-label">
              <i class="fas fa-trophy"></i>
              <span>Patrimonio Neto</span>
            </div>
            <div class="item-value">${{ format(totales.patrimonioNeto) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- SUMMARY METRICS -->
    <div class="summary-metrics">
      <h3>
        <i class="fas fa-chart-bar"></i>
        Indicadores Financieros
      </h3>

      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-icon">
            <i class="fas fa-balance-scale"></i>
          </div>
          <div class="metric-content">
            <span class="metric-label">Balance General</span>
            <span class="metric-value" :class="{ balanced: totales.balanceGeneral === 0, unbalanced: totales.balanceGeneral !== 0 }">
              {{ totales.balanceGeneral === 0 ? 'Balanceado' : 'Desbalanceado' }}
            </span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon">
            <i class="fas fa-percentage"></i>
          </div>
          <div class="metric-content">
            <span class="metric-label">Liquidez</span>
            <span class="metric-value">${{ format(totales.liquidez) }}</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon">
            <i class="fas fa-users"></i>
          </div>
          <div class="metric-content">
            <span class="metric-label">Ahorro Promedio por Socio</span>
            <span class="metric-value">${{ format(totales.ahorroPromedio) }}</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon">
            <i class="fas fa-trending-up"></i>
          </div>
          <div class="metric-content">
            <span class="metric-label">Crecimiento Mensual</span>
            <span class="metric-value" :class="{ positive: totales.crecimientoMensual >= 0, negative: totales.crecimientoMensual < 0 }">
              {{ format(totales.crecimientoMensual) }}%
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

const balanceData = ref([])
const lastUpdate = ref('')

const notification = ref({
  show: false,
  type: 'success',
  icon: 'Estadisticas',
  message: ''
})

const showNotification = (type, icon, message) => {
  notification.value = { show: true, type, icon, message }
  setTimeout(() => (notification.value.show = false), 4000)
}

onMounted(() => {
  calcularBalance()
})

const calcularBalance = async () => {
  try {
    const response = await fetch('/api/registro-aportes')
    const result = await response.json()

    if (!result.success || result.data.length === 0) {
      balanceData.value = []
      showNotification('warning', 'Advertencia', 'No existen registros de aportes para calcular el balance')
      return
    }

    balanceData.value = result.data

    // Update last update time
    lastUpdate.value = new Date().toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    showNotification('success', 'Exito', `Balance calculado (${balanceData.value.length} registros)`)

  } catch (error) {
    console.log('Backend no disponible, cargando datos de ejemplo para balance:', error.message)
    // Cargar datos de ejemplo cuando el backend no está disponible
    balanceData.value = [
      {
        socio_id: 1,
        aporte_inicial: 500,
        saldo_ahorros: 2500,
        retiro: 0
      },
      {
        socio_id: 2,
        aporte_inicial: 300,
        saldo_ahorros: 1800,
        retiro: 100
      },
      {
        socio_id: 3,
        aporte_inicial: 400,
        saldo_ahorros: 3200,
        retiro: 0
      },
      {
        socio_id: 4,
        aporte_inicial: 600,
        saldo_ahorros: 4100,
        retiro: 200
      },
      {
        socio_id: 5,
        aporte_inicial: 350,
        saldo_ahorros: 1950,
        retiro: 0
      }
    ]

    // Update last update time
    lastUpdate.value = new Date().toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    showNotification('info', 'Info', 'Balance calculado con datos de ejemplo (backend no disponible)')
  }
}

const totales = computed(() => {
  const data = balanceData.value

  // Calcular totales
  const totalAhorros = data.reduce((sum, item) => sum + Number(item.saldo_ahorros || 0), 0)
  const totalAportesIniciales = data.reduce((sum, item) => sum + Number(item.aporte_inicial || 0), 0)
  const totalRetiros = data.reduce((sum, item) => sum + Number(item.retiro || 0), 0)

  // Métricas calculadas
  const sociosActivos = new Set(data.map(item => item.socio_id)).size
  const ahorroPromedio = sociosActivos > 0 ? totalAhorros / sociosActivos : 0

  // Balance Sheet calculations
  const cajaYBancos = totalAhorros * 0.7 // Estimación: 70% en caja/bancos
  const ahorrosSocios = totalAhorros
  const prestamosPorCobrar = totalAhorros * 0.3 // Estimación: 30% en préstamos

  const cuentasPorPagar = totalRetiros * 0.5 // Estimación
  const prestamosRecibidos = totalAhorros * 0.2 // Estimación

  const capitalSocial = totalAportesIniciales
  const reservasUtilidades = totalAhorros * 0.1 // Estimación

  // Totals
  const activoTotal = cajaYBancos + ahorrosSocios + prestamosPorCobrar
  const pasivoTotal = cuentasPorPagar + prestamosRecibidos
  const patrimonioTotal = capitalSocial + reservasUtilidades
  const patrimonioNeto = activoTotal - pasivoTotal

  // Additional metrics
  const liquidez = cajaYBancos + ahorrosSocios
  const crecimientoMensual = data.length > 1 ? 5.2 : 0 // Placeholder calculation
  const balanceGeneral = activoTotal - (pasivoTotal + patrimonioTotal)

  return {
    totalAhorros,
    sociosActivos,
    ahorroPromedio,
    cajaYBancos,
    ahorrosSocios,
    prestamosPorCobrar,
    cuentasPorPagar,
    prestamosRecibidos,
    capitalSocial,
    reservasUtilidades,
    activoTotal,
    pasivoTotal,
    patrimonioTotal,
    patrimonioNeto,
    liquidez,
    crecimientoMensual,
    balanceGeneral
  }
})

const format = (n) =>
  new Intl.NumberFormat('es-EC', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(n)
</script>

<style scoped>
/* ===== MAIN CONTAINER ===== */
.balance-general-container {
  background-color: #f5f7fa;
  min-height: 100vh;
  padding: 2rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* ===== HEADER SECTION ===== */
.header-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 20px rgba(30, 136, 229, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 2rem;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.header-icon {
  background: linear-gradient(135deg, #1e88e5, #42a5f5);
  color: white;
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  box-shadow: 0 4px 12px rgba(30, 136, 229, 0.3);
}

.header-text h1 {
  margin: 0;
  color: #1565c0;
  font-size: 2.2rem;
  font-weight: 700;
}

.subtitle {
  margin: 0.5rem 0 0 0;
  color: #546e7a;
  font-size: 1.1rem;
  font-weight: 400;
}

/* ===== HEADER STATS ===== */
.header-stats {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
  min-width: 160px;
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  display: block;
  color: #1e88e5;
}

.stat-label {
  display: block;
  color: #7f8c8d;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  display: block;
  color: #2c3e50;
  font-size: 1.4rem;
  font-weight: 700;
}

/* ===== NOTIFICATION ===== */
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  min-width: 350px;
  animation: slideInRight 0.3s ease;
}

.notification.success {
  border-left: 4px solid #27ae60;
}

.notification.warning {
  border-left: 4px solid #f39c12;
}

.notification.error {
  border-left: 4px solid #e74c3c;
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
}

.notification-icon {
  font-size: 1.5rem;
}

.notification-message {
  flex: 1;
  font-weight: 500;
  color: #2c3e50;
}

.notification-close {
  background: none;
  border: none;
  color: #7f8c8d;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.notification-close:hover {
  background-color: #f8f9fa;
}

/* ===== ACTIONS BAR ===== */
.actions-bar {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.btn-primary {
  background: linear-gradient(135deg, #1e88e5, #42a5f5);
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 12px rgba(30, 136, 229, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(30, 136, 229, 0.4);
}

.btn-primary i {
  font-size: 1rem;
}

.last-update {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #546e7a;
  font-size: 0.9rem;
}

.last-update i {
  color: #1e88e5;
}

/* ===== BALANCE SECTIONS ===== */
.balance-sections {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.balance-section {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
  border-top: 4px solid;
}

.activo-section {
  border-top-color: #27ae60;
}

.pasivo-section {
  border-top-color: #e74c3c;
}

.patrimonio-section {
  border-top-color: #1e88e5;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f1f3f4;
}

.section-header h3 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.activo-section .section-header h3 {
  color: #27ae60;
}

.pasivo-section .section-header h3 {
  color: #e74c3c;
}

.patrimonio-section .section-header h3 {
  color: #1e88e5;
}

.section-header h3 i {
  font-size: 1.2rem;
}

.section-total {
  font-size: 1.5rem;
  font-weight: 800;
  color: #2c3e50;
}

.balance-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.balance-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.balance-item:hover {
  background: #e3f2fd;
}

.balance-item.highlighted {
  background: linear-gradient(135deg, #e3f2fd, #f8f9fa);
  border-left: 4px solid #1e88e5;
}

.item-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
  color: #2c3e50;
}

.item-label i {
  color: #1e88e5;
  font-size: 1.1rem;
}

.item-value {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1565c0;
}

/* ===== SUMMARY METRICS ===== */
.summary-metrics {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
}

.summary-metrics h3 {
  margin: 0 0 1.5rem 0;
  color: #2c3e50;
  font-size: 1.6rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.summary-metrics h3 i {
  color: #1e88e5;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.metric-card {
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  padding: 1.5rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.metric-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.metric-icon {
  background: linear-gradient(135deg, #1e88e5, #42a5f5);
  color: white;
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.metric-content {
  flex: 1;
}

.metric-label {
  display: block;
  color: #7f8c8d;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.metric-value {
  display: block;
  color: #2c3e50;
  font-size: 1.3rem;
  font-weight: 700;
}

.metric-value.positive {
  color: #27ae60;
}

.metric-value.negative {
  color: #e74c3c;
}

.metric-value.balanced {
  color: #27ae60;
}

.metric-value.unbalanced {
  color: #e74c3c;
}

/* ===== RESPONSIVE DESIGN ===== */
@media (max-width: 1024px) {
  .balance-sections {
    grid-template-columns: 1fr;
  }

  .header-section {
    flex-direction: column;
    text-align: center;
  }

  .header-stats {
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .balance-general-container {
    padding: 1rem;
  }

  .header-section,
  .actions-bar,
  .balance-section,
  .summary-metrics {
    padding: 1.5rem;
  }

  .header-stats {
    flex-direction: column;
    width: 100%;
  }

  .stat-card {
    min-width: auto;
    width: 100%;
  }

  .metrics-grid {
    grid-template-columns: 1fr;
  }

  .balance-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .item-label,
  .item-value {
    width: 100%;
    text-align: left;
  }
}

/* ===== ANIMATIONS ===== */
@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes fadeInUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.header-section,
.actions-bar,
.balance-section,
.summary-metrics {
  animation: fadeInUp 0.6s ease;
}

/* ===== SCROLLBAR STYLING ===== */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #1e88e5, #42a5f5);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #1565c0, #1976d2);
}
</style>
